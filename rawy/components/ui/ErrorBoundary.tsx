import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { AlertTriangle } from 'lucide-react-native';
import { Spacing, Radius, Palette } from '@/constants/theme';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onReset?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        this.props.onReset?.();
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <View style={styles.container}>
                    <View style={styles.card}>
                        <AlertTriangle size={48} color="#FFD700" style={styles.icon} />
                        <Text variant="headlineSmall" style={styles.title}>
                            Oops, something went wrong
                        </Text>
                        <Text variant="bodyMedium" style={styles.message}>
                            An unexpected error occurred. You can try refreshing the page or going back.
                        </Text>
                        <Button
                            mode="contained"
                            onPress={this.handleReset}
                            style={styles.button}
                            contentStyle={styles.buttonContent}
                        >
                            Try Again
                        </Button>
                    </View>
                </View>
            );
        }

        return this.props.children;
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        backgroundColor: '#F9FAFB',
    },
    card: {
        maxWidth: 400,
        width: '100%',
        padding: Spacing.xl,
        borderRadius: Radius.xl,
        backgroundColor: Palette.light.surface,
        alignItems: 'center',
        shadowColor: Palette.black.pure,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    icon: {
        marginBottom: Spacing.md,
    },
    title: {
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.sm,
        color: Palette.text.lightPrimary,
    },
    message: {
        textAlign: 'center',
        color: '#6B7280',
        marginBottom: Spacing.lg,
        lineHeight: 20,
    },
    button: {
        width: '100%',
        borderRadius: Radius.md,
    },
    buttonContent: {
        paddingVertical: 4,
    },
});
