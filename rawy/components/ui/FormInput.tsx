/**
 * FormInput — reusable form input wrapping React Native Paper TextInput +
 * React Hook Form Controller.
 *
 * Features:
 *  - Auto-displays Zod validation errors
 *  - Lucide icon slots (left via icon prop)
 *  - Password visibility toggle
 *  - Error state styling
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, HelperText, useTheme } from 'react-native-paper';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react-native';

interface FormInputProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  icon?: React.ReactNode;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  style?: object;
}

export function FormInput<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  icon,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoCorrect = true,
  editable = true,
  multiline = false,
  numberOfLines,
  style,
}: FormInputProps<T>) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const theme = useTheme();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View style={[styles.container, style]}>
          <TextInput
            mode="outlined"
            label={label}
            placeholder={placeholder}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={!!error}
            disabled={!editable}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            autoCorrect={autoCorrect}
            multiline={multiline}
            numberOfLines={numberOfLines}
            left={icon ? <TextInput.Icon icon={() => icon} /> : undefined}
            right={
              secureTextEntry ? (
                <TextInput.Icon
                  icon={() =>
                    isPasswordVisible ? (
                      <EyeOff size={20} color={theme.colors.onSurfaceVariant} />
                    ) : (
                      <Eye size={20} color={theme.colors.onSurfaceVariant} />
                    )
                  }
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                />
              ) : undefined
            }
            outlineStyle={styles.outline}
            style={[
              styles.input,
              { backgroundColor: '#FFFFFF' },
              multiline && { minHeight: (numberOfLines || 3) * 24 },
            ]}
            theme={{
              roundness: 12,
            }}
          />
          {error && (
            <HelperText type="error" visible={!!error} style={styles.error}>
              {error.message}
            </HelperText>
          )}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
  },
  input: {
    fontSize: 15,
  },
  outline: {
    borderRadius: 12,
  },
  error: {
    paddingHorizontal: 4,
    fontSize: 12,
  },
});
