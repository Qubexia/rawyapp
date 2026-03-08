import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/validation/auth.schemas';
import { resetPassword } from '@/services/auth.service';
import { ApiError } from '@/services/axios-client';

export function useResetPassword(email: string) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { otp: '', newPassword: '', confirmPassword: '' },
    mode: 'onSubmit',
  });

  const handleSubmit = form.handleSubmit(
    useCallback(
      async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        setServerError(null);
        try {
          await resetPassword(email, data.otp, data.newPassword);
          router.replace('/(auth)/login');
        } catch (err) {
          if (err instanceof ApiError) {
            if (err.statusCode === 400) {
              setServerError(err.message || 'Invalid or expired reset code');
            } else {
              setServerError(err.message || 'Something went wrong');
            }
          } else {
            setServerError('Unable to connect to server');
          }
        } finally {
          setIsLoading(false);
        }
      },
      [email, router],
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

export default useResetPassword;
