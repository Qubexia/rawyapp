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
import {
  registerUserSchema,
  registerCreatorSchema,
  RegisterUserFormData,
} from '../validation/auth.schemas';
import { registerUser, registerCreator } from '../services/auth.service';
import { useAuthContext } from '../context/auth-context';
import { ApiError } from '../services/axios-client';

// ─── Types ───────────────────────────────────────────────────────────────────

export type RegisterTab = 'user' | 'creator';

type RegisterFormData = RegisterUserFormData & { showName?: string };

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useRegister() {
  const router = useRouter();
  const { setSession } = useAuthContext();

  const [activeTab, setActiveTabState] = useState<RegisterTab>('user');
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(
      activeTab === 'creator' ? registerCreatorSchema : registerUserSchema,
    ),
    defaultValues: { name: '', email: '', password: '', showName: '' },
    mode: 'onSubmit',
  });

  const setActiveTab = useCallback(
    (tab: RegisterTab) => {
      setActiveTabState(tab);
      form.clearErrors();
      setServerError(null);
    },
    [form],
  );

  const handleSubmit = form.handleSubmit(
    useCallback(
      async (data: RegisterFormData) => {
        setIsLoading(true);
        setServerError(null);

        try {
          let tokens;

          if (activeTab === 'user') {
            tokens = await registerUser({
              name: data.name,
              email: data.email,
              password: data.password,
            });
          } else {
            tokens = await registerCreator({
              name: data.name,
              email: data.email,
              password: data.password,
              showName: data.showName || '',
            });
          }

          setSession(tokens);
          await AsyncStorage.setItem('@has_seen_onboarding', 'true').catch(() => {});
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
                } else if (lower.includes('show')) {
                  form.setError('showName', { message: msg });
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
      [activeTab, setSession, router, form],
    ),
  );

  return {
    activeTab,
    setActiveTab,
    control: form.control,
    errors: form.formState.errors,
    isLoading,
    serverError,
    handleSubmit,
  };
}
