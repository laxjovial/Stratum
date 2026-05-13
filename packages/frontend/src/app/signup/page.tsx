'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthError } from '../../hooks/use-auth';
import Link from 'next/link';
import { Mail, CheckCircle, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { AuthInput } from '../../components/AuthInput';
import { LoadingButton } from '../../components/LoadingButton';
import { getEmailProviderUrl } from '../../lib/email-utils';
import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// Configure zxcvbn
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
}
zxcvbnOptions.setOptions(options);

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const router = useRouter();
  const { signup, user } = useAuth();

  // Password Strength Logic
  const strength = useMemo(() => {
    if (!password) return null;
    return zxcvbn(password);
  }, [password]);

  const strengthData = [
    { label: 'Too Weak', color: 'bg-red-500', text: 'text-red-500', minScore: 0 },
    { label: 'Weak', color: 'bg-orange-500', text: 'text-orange-500', minScore: 1 },
    { label: 'Fair', color: 'bg-yellow-500', text: 'text-yellow-500', minScore: 2 },
    { label: 'Strong', color: 'bg-blue-500', text: 'text-blue-500', minScore: 3 },
    { label: 'Secure', color: 'bg-green-500', text: 'text-green-600', minScore: 4 },
  ];

  // Smart Inbox Logic
  const emailProvider = useMemo(() => getEmailProviderUrl(email), [email]);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && user.emailVerified && !isSubmitted) {
      router.push('/welcome');
    }
  }, [user, router, isSubmitted]);

  // Auto-login detection after submission
  useEffect(() => {
    if (isSubmitted && user?.emailVerified) {
      router.push('/welcome'); 
    }
  }, [user, isSubmitted, router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (strength && strength.score < 2) {
      setError('Password is too weak. Please add more variety.');
      return;
    }

    setIsLoading(true);
    try {
      await signup(email, password);
      setIsSubmitted(true);
    } catch (err: any) {
      const authError = err as AuthError;
      // Handle "User already exists" by redirecting to login with pre-filled email
      if (authError.type === 'user-exists') {
        setError('An account with this email already exists. Redirecting to login...');
        setTimeout(() => {
          router.push(`/login?email=${encodeURIComponent(email)}`);
        }, 2000);
      } else {
        setError(authError.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-2xl border border-gray-100 text-center animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
          <div className="relative flex justify-center">
            <div className="bg-blue-600 p-5 rounded-3xl shadow-lg shadow-blue-200 relative z-10">
              <Mail className="text-white w-10 h-10" />
            </div>
            {/* Animated Pulsing Ring */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-24 h-24 bg-blue-400 rounded-full animate-ping opacity-10"></div>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight">Confirm your email</h2>
            <p className="text-gray-500 px-2 leading-relaxed">
              A verification link is on its way to <span className="font-bold text-gray-900 break-all">{email}</span>
            </p>
          </div>

          <div className="bg-blue-50/50 rounded-2xl p-6 border border-blue-100/50 space-y-4">
            <p className="text-xs text-blue-700 font-bold uppercase tracking-widest">
              Smart Inbox Link
            </p>
            <a 
              href={emailProvider.url || '#'} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-3 py-4 px-6 bg-white border border-blue-200 rounded-xl shadow-sm text-blue-700 hover:text-blue-900 hover:bg-white hover:shadow-md hover:-translate-y-0.5 transition-all group font-extrabold"
            >
              <span>Open {emailProvider.name}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          <div className="pt-2 flex flex-col items-center space-y-8">
            <div className="flex items-center space-x-4 text-sm text-gray-400 font-bold">
              <div className="flex space-x-1.5">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:1s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-duration:1s] [animation-delay:0.4s]"></span>
              </div>
              <span className="uppercase tracking-widest text-[10px]">Verifying in real-time</span>
            </div>

            <div className="flex flex-col w-full space-y-4">
              <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-blue-600 transition-colors">
                Already verified? <span className="text-blue-600 underline underline-offset-4">Log in manually</span>
              </Link>
              <button 
                onClick={() => setIsSubmitted(false)}
                className="text-[10px] text-gray-400 hover:text-gray-600 uppercase tracking-[0.2em] font-black transition-colors"
              >
                Wrong email? Go back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Join the Stratum Network</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-6" noValidate>
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={error && (error.includes('email') || error.includes('account')) ? error : null}
            required
            autoComplete="email"
          />

          <div className="space-y-3">
            <AuthInput
              label="Secure Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
            
            {/* Enhanced Strength Meter */}
            {password && strength && (
              <div className="space-y-2 px-1 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.15em]">
                  <span className="text-gray-400">Security Score</span>
                  <span className={strengthData[strength.score].text}>
                    {strengthData[strength.score].label}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div 
                      key={i}
                      className={`h-full flex-1 transition-all duration-500 ${
                        i <= strength.score ? strengthData[strength.score].color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {strength.feedback.suggestions.length > 0 && strength.score < 3 && (
                  <p className="text-[10px] text-gray-400 leading-tight italic font-medium flex items-start gap-1">
                    <span className="text-blue-500 not-italic font-black">TIP:</span>
                    {strength.feedback.suggestions[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-2">
            <LoadingButton
              type="submit"
              isLoading={isLoading}
            >
              Get Started
            </LoadingButton>
            
            {error && !error.includes('email') && !error.includes('account') && (
              <div role="alert" className="flex items-center justify-center space-x-3 text-red-600 text-xs font-bold mt-6 p-4 bg-red-50 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </form>

        <div className="text-center pt-2">
          <p className="text-sm text-gray-500 font-bold">
            Already a member?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 underline underline-offset-4 transition-colors">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
