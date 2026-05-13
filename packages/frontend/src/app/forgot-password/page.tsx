'use client';

import { useState } from 'react';
import { useAuth, AuthError } from '../../hooks/use-auth';
import Link from 'next/link';
import { AuthInput } from '../../components/AuthInput';
import { LoadingButton } from '../../components/LoadingButton';
import { Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true);
    
    try {
      await resetPassword(email);
      setMessage('Password reset email sent! Please check your inbox.');
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="space-y-2 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="text-blue-600 w-8 h-8" />
            </div>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
          <p className="text-sm text-gray-500">We'll send you a link to get back into your account.</p>
        </div>

        {!message ? (
          <form onSubmit={handleResetPassword} className="space-y-5" noValidate>
            <AuthInput
              label="Email Address"
              type="email"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error}
              required
              autoComplete="email"
            />

            <div className="pt-2">
              <LoadingButton
                type="submit"
                isLoading={isLoading}
              >
                Send Reset Link
              </LoadingButton>
            </div>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center animate-in fade-in zoom-in">
            <p className="text-green-800 text-sm font-medium">
              {message}
            </p>
          </div>
        )}

        <div className="text-center pt-2">
          <Link 
            href="/login" 
            className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
