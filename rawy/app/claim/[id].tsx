import React, { useState } from 'react';
import { View, StyleSheet, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Button, Surface, useTheme, TextInput, HelperText } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mail, ShieldCheck, Headphones, CheckCircle } from 'lucide-react-native';

import { Palette, Spacing, Radius } from '@/constants/theme';
import { useClaimPodcast, useVerifyClaim } from '@/hooks/queries/use-claims';
import { useAuthContext } from '@/context/auth-context';

export default function ClaimDetailScreen() {
  const { id, title, author, artworkUrl } = useLocalSearchParams<{
    id: string;
    title: string;
    author: string;
    artworkUrl: string;
  }>();
  const theme = useTheme();
  const router = useRouter();
  const { updateUserRole } = useAuthContext();
  
  const podcast = { id, title, author, artworkUrl };

  const claimMutation = useClaimPodcast();
  const verifyMutation = useVerifyClaim();

  const [step, setStep] = useState<'IDLE' | 'SENT' | 'VERIFIED'>('IDLE');
  const [token, setToken] = useState('');

  const handleRequestClaim = async () => {
    try {
      if (!podcast) return;
      // We pass the ID to initiate the claim request.
      // This assumes the backend handles the import or mapping for this appleId.
      await claimMutation.mutateAsync(id || '');
      setStep('SENT');
    } catch (error) {
      console.error('Failed to claim podcast', error);
      // For UI testing without backend support for external claim, simulate success:
      // setStep('SENT');
    }
  };

  const handleVerify = async () => {
    if (!token) return;
    try {
      await verifyMutation.mutateAsync(token);
      updateUserRole('CREATOR');
      setStep('VERIFIED');
    } catch (error) {
      console.error('Failed to verify token', error);
      // For UI testing:
      // updateUserRole('CREATOR');
      // setStep('VERIFIED');
    }
  };

  const coverUri = podcast?.artworkUrl;

  if (!podcast && !claimMutation.isPending && step === 'IDLE') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Button icon={() => <ArrowLeft size={20} color={theme.colors.onBackground} />} onPress={() => router.back()}>
            Back
          </Button>
        </View>
        <View style={styles.center}>
          <Headphones size={48} color={theme.colors.onSurfaceVariant} />
          <Text style={{ marginTop: Spacing.md, color: theme.colors.onSurfaceVariant }}>Loading podcast details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Button icon={() => <ArrowLeft size={20} color={theme.colors.onBackground} />} onPress={() => router.back()}>
          Back
        </Button>
      </View>
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {podcast && (
            <Surface style={styles.podcastCard} elevation={0}>
              <View style={styles.coverWrapper}>
                {coverUri ? (
                  <Image source={{ uri: coverUri }} style={styles.cover} />
                ) : (
                  <View style={[styles.cover, styles.placeholder]}>
                    <Headphones size={32} color={Palette.primary[500]} />
                  </View>
                )}
                <View style={styles.badge}>
                  <ShieldCheck size={16} color={Palette.white.pure} />
                </View>
              </View>
              <Text variant="headlineSmall" style={styles.title}>{podcast.title}</Text>
              <Text variant="bodyMedium" style={styles.author}>by {podcast.author || 'Unknown'}</Text>
            </Surface>
          )}

          {step === 'IDLE' && (
            <View style={styles.card}>
              <Text variant="titleMedium" style={styles.cardTitle}>Verify Ownership</Text>
              <Text variant="bodyMedium" style={styles.cardText}>
                To claim "{podcast?.title}", we will send a verification link to the email address registered in the podcast's RSS feed.
              </Text>
              
              <Button
                mode="contained"
                onPress={handleRequestClaim}
                loading={claimMutation.isPending}
                disabled={claimMutation.isPending}
                style={styles.mainButton}
              >
                Send Verification Email
              </Button>
              {claimMutation.isError && (
                <HelperText type="error" visible={true}>
                  Claim request failed. Please try again.
                </HelperText>
              )}
            </View>
          )}

          {step === 'SENT' && (
            <View style={styles.card}>
              <View style={styles.iconCircle}>
                <Mail size={32} color={Palette.primary[500]} />
              </View>
              <Text variant="titleMedium" style={[styles.cardTitle, { textAlign: 'center' }]}>Check Your Email</Text>
              <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
                We've sent a verification code to the RSS email address. Click the link in the email or enter the token below.
              </Text>
              
              <TextInput
                mode="outlined"
                label="Verification Token"
                value={token}
                onChangeText={setToken}
                autoCapitalize="none"
                style={styles.input}
              />
              {verifyMutation.isError && (
                <HelperText type="error" visible={true}>
                  Invalid or expired verification token.
                </HelperText>
              )}
              
              <Button
                mode="contained"
                onPress={handleVerify}
                loading={verifyMutation.isPending}
                disabled={!token || verifyMutation.isPending}
                style={styles.mainButton}
              >
                Verify Claim
              </Button>
            </View>
          )}

          {step === 'VERIFIED' && (
            <View style={styles.card}>
              <View style={[styles.iconCircle, { backgroundColor: '#dcfce7' }]}>
                <CheckCircle size={32} color="#22c55e" />
              </View>
              <Text variant="titleMedium" style={[styles.cardTitle, { textAlign: 'center' }]}>Podcast Claimed!</Text>
              <Text variant="bodyMedium" style={[styles.cardText, { textAlign: 'center' }]}>
                You are now the verified owner of "{podcast?.title}". Your account has been upgraded to a Creator account.
              </Text>
              
              <Button
                mode="contained"
                onPress={() => router.push('/(creator)/creator-dashboard' as any)}
                style={styles.mainButton}
              >
                Go to Creator Dashboard
              </Button>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: Spacing.sm, flexDirection: 'row' },
  scroll: { padding: Spacing.xl, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  podcastCard: { alignItems: 'center', marginBottom: Spacing.xxl, backgroundColor: 'transparent' },
  coverWrapper: { position: 'relative', marginBottom: Spacing.md },
  cover: { width: 120, height: 120, borderRadius: Radius.lg },
  placeholder: { backgroundColor: Palette.primary[50], justifyContent: 'center', alignItems: 'center' },
  badge: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: Palette.primary[500],
    borderRadius: Radius.full,
    padding: 6,
    borderWidth: 2,
    borderColor: Palette.white.pure
  },
  title: { fontWeight: '700', textAlign: 'center', marginBottom: Spacing.xs },
  author: { color: Palette.text.lightSecondary, textAlign: 'center' },
  card: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    backgroundColor: Palette.light.surface,
    elevation: 2,
    alignItems: 'stretch'
  },
  cardTitle: { fontWeight: '600', marginBottom: Spacing.sm },
  cardText: { color: Palette.text.lightSecondary, marginBottom: Spacing.lg, lineHeight: 22 },
  mainButton: { marginTop: Spacing.sm, paddingVertical: 4 },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: Palette.primary[50],
    justifyContent: 'center', alignItems: 'center',
    alignSelf: 'center', marginBottom: Spacing.md
  },
  input: { marginBottom: Spacing.sm }
});
