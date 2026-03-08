import React from 'react';
import {
    Pressable,
    PressableProps,
    StyleProp,
    ViewStyle,
    Platform,
    StyleSheet,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface InteractiveProps extends PressableProps {
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    rippleColor?: string;
    activeOpacity?: number;
}

/**
 * Standard interactive wrapper with android ripple and touch opacity feedback.
 */
export function Interactive({
    children,
    style,
    rippleColor,
    activeOpacity = 0.7,
    ...props
}: InteractiveProps) {
    const theme = useTheme();

    return (
        <Pressable
            {...props}
            android_ripple={{
                color: rippleColor || theme.colors.primaryContainer,
                ...props.android_ripple,
            }}
            style={({ pressed }) => [
                style,
                Platform.OS === 'ios' && pressed && { opacity: activeOpacity },
            ]}
        >
            {children}
        </Pressable>
    );
}
