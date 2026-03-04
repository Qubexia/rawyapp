import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { ApiRequestError } from "../services/api";
import { useAuthContext } from "../context/auth-context";

export interface LoginFields {
  email: string;
  password: string;
}

export interface LoginErrors {
  email?: string;
  password?: string;
}

const INITIAL: LoginFields = { email: "", password: "" };

export function useLogin() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [fields, setFields] = useState<LoginFields>(INITIAL);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setField = useCallback(
    <K extends keyof LoginFields>(k: K, v: LoginFields[K]) => {
      setFields((p) => ({ ...p, [k]: v }));
      setErrors((p) => ({ ...p, [k]: undefined }));
      setServerError(null);
    },
    [],
  );

  function validate(): LoginErrors {
    const out: LoginErrors = {};
    const email = fields.email.trim();
    if (!email) out.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      out.email = "Enter a valid email";

    if (!fields.password) out.password = "Password is required";
    return out;
  }

  const handleSubmit = useCallback(async () => {
    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      return;
    }

    setIsLoading(true);
    setServerError(null);

    try {
      await login({
        email: fields.email.trim().toLowerCase(),
        password: fields.password,
      });
      router.replace("/(tabs)");
    } catch (err) {
      if (err instanceof ApiRequestError) {
        if (err.statusCode === 401) setServerError("Invalid email or password");
        else setServerError(err.message || "Login failed");
      } else {
        setServerError("Unable to connect to server");
      }
    } finally {
      setIsLoading(false);
    }
  }, [fields, login, router]);

  return { fields, setField, errors, isLoading, serverError, handleSubmit };
}

export default useLogin;
