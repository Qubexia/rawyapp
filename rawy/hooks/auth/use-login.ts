/**
 * useLogin — login form hook using React Hook Form + Zod.
 */

import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/utils/constants';
import { loginSchema, LoginFormData } from '@/validation/auth.schemas';
import { useAuthContext } from '@/context/auth-context';
import { ApiError } from '@/services/axios-client';

export function useLogin() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onSubmit',
  });

  const handleSubmit = form.handleSubmit(
    useCallback(
      async (data: LoginFormData) => {
        setIsLoading(true);
        setServerError(null);

        try {
          await login(data);
          await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true').catch(() => {});
          router.replace('/(tabs)');
        } catch (err) {
          if (err instanceof ApiError) {
            if (err.statusCode === 401) {
              setServerError('Invalid email or password');
            } else {
              setServerError(err.message || 'Login failed');
            }
          } else {
            setServerError('Unable to connect to server');
          }
        } finally {
          setIsLoading(false);
        }
      },
      [login, router],
    ),
  );

  return {
    control: form.control,
    errors: form.formState.errors,
    isLoading,
    serverError,
    handleSubmit,
    setServerError,
  };
}

export default useLogin;
