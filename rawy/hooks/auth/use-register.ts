/**
 * useRegister — register form hook using React Hook Form + Zod.
 *
 * Supports both user and creator tabs with dynamic schema switching.
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';
import {
  registerUserSchema,
  RegisterUserFormData,
} from '@/validation/auth.schemas';
import { registerUser } from '@/services/auth.service';
import { useAuthContext } from '@/context/auth-context';
import { ApiError } from '@/services/axios-client';

// ─── Types ───────────────────────────────────────────────────────────────────

type RegisterFormData = RegisterUserFormData;

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRegister() {
  const router = useRouter();
  const { setSession } = useAuthContext();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: { name: '', email: '', password: '' },
    mode: 'onSubmit',
  });

  const handleSubmit = form.handleSubmit(
    useCallback(
      async (data: RegisterFormData) => {
        setIsLoading(true);
        setServerError(null);

        try {
          const tokens = await registerUser({
            name: data.name,
            email: data.email,
            password: data.password,
          });

          setSession(tokens);
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true').catch(() => {});
          router.replace('/(tabs)');
        } catch (err) {
          if (err instanceof ApiError) {
            if (err.statusCode === 409) {
              setServerError('An account with this email already exists.');
            } else if (err.statusCode === 400) {
              // Map backend field errors
              const msgs = err.errors;
              let hasFieldError = false;

              msgs.forEach((msg) => {
                const lower = msg.toLowerCase();
                if (lower.includes('name') && !lower.includes('show')) {
                  form.setError('name', { message: msg });
                  hasFieldError = true;
                } else if (lower.includes('email')) {
                  form.setError('email', { message: msg });
                  hasFieldError = true;
                } else if (lower.includes('password')) {
                  form.setError('password', { message: msg });
                  hasFieldError = true;
                }
              });

              if (!hasFieldError) {
                setServerError(msgs.join('\n'));
              }
            } else {
              setServerError(
                err.message || 'Something went wrong. Please try again.',
              );
            }
          } else {
            setServerError(
              'Unable to connect to the server. Please check your connection.',
            );
          }
        } finally {
          setIsLoading(false);
        }
      },
      [setSession, router, form],
    ),
  );

  return {
    control: form.control,
    errors: form.formState.errors,
    isLoading,
    serverError,
    handleSubmit,
  };
}
