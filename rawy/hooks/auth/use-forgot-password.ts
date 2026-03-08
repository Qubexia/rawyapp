import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/validation/auth.schemas';
import { forgotPassword } from '@/services/auth.service';
import { ApiError } from '@/services/axios-client';

export function useForgotPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
    mode: 'onSubmit',
  });

  const handleSubmit = form.handleSubmit(
    useCallback(async (data: ForgotPasswordFormData) => {
      setIsLoading(true);
      setServerError(null);
      try {
        await forgotPassword(data.email);
        setSuccess(true);
      } catch (err) {
        if (err instanceof ApiError) {
          setServerError(err.message || 'Something went wrong');
        } else {
          setServerError('Unable to connect to server');
        }
      } finally {
        setIsLoading(false);
      }
    }, []),
  );

  return {
    control: form.control,
    errors: form.formState.errors,
    isLoading,
    serverError,
    success,
    email: form.getValues('email'),
    handleSubmit,
  };
}

export default useForgotPassword;
