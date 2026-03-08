/**
 * WhoToFollow component — horizontal carousel of suggested users to follow.
 */

import React from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { UserPlus } from 'lucide-react-native';
import { CreatorCard } from '../ui';
import { useSuggestions } from '@/hooks/queries/use-suggestions';
import { Spacing } from '@/constants/theme';

export function WhoToFollow() {
    const theme = useTheme();
    const { data: suggestions, isLoading } = useSuggestions(10);

    if (isLoading || !suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <UserPlus size={20} color={theme.colors.primary} />
                <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onBackground }]}>
                    Who to Follow
                </Text>
            </View>
            <FlatList
                horizontal
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CreatorCard
                        creator={{
                            _id: item.id,
                            showName: item.name,
                            avatarUrl: item.avatarUrl,
                            followerCount: item.followerCount,
                        }}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: Spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    title: {
        fontWeight: '700',
        marginLeft: Spacing.sm,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        gap: Spacing.md,
    },
});
