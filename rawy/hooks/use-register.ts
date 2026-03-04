/**
 * useRegister – manages the register form: state, validation, submission.
 *
 * Usage:
 *   const {
 *     fields, errors, isLoading, serverError,
 *     setField, handleSubmit, activeTab, setActiveTab,
 *   } = useRegister();
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { registerUser, registerCreator } from '../services/auth.service';
import { ApiRequestError } from '../services/api';
import { useAuthContext } from '../context/auth-context';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RegisterTab = 'user' | 'creator';

export interface RegisterFields {
  name: string;
  email: string;
  password: string;
  showName: string; // creator only
}

export type RegisterErrors = Partial<Record<keyof RegisterFields, string>>;

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validate(fields: RegisterFields, tab: RegisterTab): RegisterErrors {
  const errors: RegisterErrors = {};

  const name = fields.name.trim();
  if (!name) {
    errors.name = 'Name is required';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (name.length > 50) {
    errors.name = 'Name must not exceed 50 characters';
  }

  const email = fields.email.trim();
  if (!email) {
    errors.email = 'Email is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Enter a valid email address';
  }

  if (!fields.password) {
    errors.password = 'Password is required';
  } else if (fields.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  }

  if (tab === 'creator') {
    const showName = fields.showName.trim();
    if (!showName) {
      errors.showName = 'Show / Podcast name is required';
    } else if (showName.length < 2) {
      errors.showName = 'Show name must be at least 2 characters';
    } else if (showName.length > 100) {
      errors.showName = 'Show name must not exceed 100 characters';
    }
  }

  return errors;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

const INITIAL_FIELDS: RegisterFields = {
  name: '',
  email: '',
  password: '',
  showName: '',
};

export function useRegister() {
  const router = useRouter();
  const { setSession } = useAuthContext();

  const [activeTab, setActiveTab] = useState<RegisterTab>('user');
  const [fields, setFields] = useState<RegisterFields>(INITIAL_FIELDS);
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /** Update a single field and clear its error. */
  const setField = useCallback(
    <K extends keyof RegisterFields>(key: K, value: RegisterFields[K]) => {
      setFields((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
      setServerError(null);
    },
    [],
  );

  /** Switch tabs and clear validation state. */
  const handleTabChange = useCallback((tab: RegisterTab) => {
    setActiveTab(tab);
    setErrors({});
    setServerError(null);
  }, []);

  /** Submit the form – validates, calls backend, updates auth context. */
  const handleSubmit = useCallback(async () => {
    const validationErrors = validate(fields, activeTab);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      let tokens;

      if (activeTab === 'user') {
        tokens = await registerUser({
          name: fields.name.trim(),
          email: fields.email.trim().toLowerCase(),
          password: fields.password,
        });
      } else {
        tokens = await registerCreator({
          name: fields.name.trim(),
          email: fields.email.trim().toLowerCase(),
          password: fields.password,
          showName: fields.showName.trim(),
        });
      }

      // Update auth context with the new session
      setSession(tokens);

      // Navigate to the main app
      router.replace('/(tabs)');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        // Map well-known status codes to friendly messages
        if (err.statusCode === 409) {
          setServerError('An account with this email already exists.');
        } else if (err.statusCode === 400) {
          // Backend validation errors – show them field-by-field if possible
          const msgs = err.errors;
          const fieldErrors: RegisterErrors = {};
          let hasFieldError = false;

          msgs.forEach((msg) => {
            const lower = msg.toLowerCase();
            if (lower.includes('name') && !lower.includes('show')) {
              fieldErrors.name = msg;
              hasFieldError = true;
            } else if (lower.includes('email')) {
              fieldErrors.email = msg;
              hasFieldError = true;
            } else if (lower.includes('password')) {
              fieldErrors.password = msg;
              hasFieldError = true;
            } else if (lower.includes('show')) {
              fieldErrors.showName = msg;
              hasFieldError = true;
            }
          });

          if (hasFieldError) {
            setErrors(fieldErrors);
          } else {
            setServerError(msgs.join('\n'));
          }
        } else {
          setServerError(err.message || 'Something went wrong. Please try again.');
        }
      } else {
        setServerError('Unable to connect to the server. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [fields, activeTab, setSession, router]);

  return {
    activeTab,
    setActiveTab: handleTabChange,
    fields,
    setField,
    errors,
    isLoading,
    serverError,
    handleSubmit,
  };
}
