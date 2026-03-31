'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { apiClient } from '../../../lib/api';
import { AxiosError } from 'axios';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await apiClient.post('/auth/login', { email, password });
        // The response interceptor auto-unwraps the TransformInterceptor envelope
        const { accessToken, user } = response.data;
        
        if (!user || user.role !== 'ADMIN') {
           setError('Access denied. Admin privileges required.');
           setLoading(false);
           return;
        }

        login(accessToken, { 
           id: user.id || user._id, 
           email: user.email, 
           role: user.role, 
           firstName: user.firstName || user.name, 
           lastName: user.lastName 
        });
    } catch (err) {
        setLoading(false);
        if (err instanceof AxiosError) {
            setError(`Error: ${err.response?.status} - ${err.response?.data?.message || err.response?.statusText}`);
        } else if (err instanceof Error) {
            setError(`Error: ${err.message}`);
        } else {
            setError('An unexpected error occurred');
        }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight text-gray-900">
            Rawy Admin
          </CardTitle>
          <p className="text-sm text-gray-500">
            Sign in to access the dashboard
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="Email Address" 
              type="email" 
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="admin@rawy.com"
              required 
            />
            <Input 
              label="Password" 
              type="password" 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="AdminPassword123!"
              required 
            />
            {error && <div className="text-sm text-red-500">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
