'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, AuthError } from '../../hooks/use-auth';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { AuthInput } from '../../components/AuthInput';
import { LoadingButton } from '../../components/LoadingButton';

const MAX_ATTEMPTS = 3;
const COOLDOWN_SECONDS = 30;

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Rate limiting state
  const [attempts, setAttempts] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  
  const { login, user } = useAuth();
  const emailRef = useRef<HTMLInputElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/welcome');
    }
  }, [user, router]);

  // Initialize cooldown from localStorage
  useEffect(() => {
    const storedCooldown = localStorage.getItem('login_cooldown_until');
    if (storedCooldown) {
      const until = parseInt(storedCooldown, 10);
      const remaining = Math.ceil((until - Date.now()) / 1000);
      if (remaining > 0) {
        setCooldown(remaining);
      } else {
        localStorage.removeItem('login_cooldown_until');
      }
    }
  }, []);

  // Cooldown timer logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            localStorage.removeItem('login_cooldown_until');
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setError(null);
    setIsLoading(true);

    try {
      await login(email, password, rememberMe);
      router.push('/'); 
    } catch (err: any) {
      const authError = err as AuthError;
      setError(authError.message);
      
      // Handle rate limiting
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        const cooldownUntil = Date.now() + COOLDOWN_SECONDS * 1000;
        localStorage.setItem('login_cooldown_until', cooldownUntil.toString());
        setCooldown(COOLDOWN_SECONDS);
      }

      // Focus first error field
      if (authError.type === 'invalid-input' || authError.type === 'wrong-credentials') {
        emailRef.current?.focus();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-2xl shadow-xl border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Welcome Back</h2>
        <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">Enter your credentials</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-6" noValidate>
        <AuthInput
          ref={emailRef}
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error && (error.includes('email') || error.includes('credentials')) ? error : null}
          required
          autoComplete="email"
        />

        <div className="space-y-1">
          <AuthInput
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex justify-end px-1">
            <Link 
              href="/forgot-password" 
              className="text-xs font-bold text-blue-600 hover:text-blue-500 transition-colors uppercase tracking-wider"
            >
              Forgot Password?
            </Link>
          </div>
        </div>

        <div className="flex items-center px-1">
          <label className="flex items-center space-x-3 cursor-pointer group">
            <div className="relative flex items-center justify-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 transition-all checked:border-blue-600 checked:bg-blue-600 hover:border-blue-400"
              />
              <svg className="absolute h-3.5 w-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>
            <span className="text-sm text-gray-500 font-bold group-hover:text-gray-700 transition-colors select-none uppercase tracking-tight">Keep me signed in</span>
          </label>
        </div>

        <div className="space-y-4 pt-2">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            disabled={cooldown > 0}
          >
            {cooldown > 0 ? (
              <span className="flex items-center gap-2">
                Locked for {cooldown}s
              </span>
            ) : 'Sign In'}
          </LoadingButton>
          
          {error && !error.includes('email') && !error.includes('credentials') && (
            <div role="alert" className="flex items-center justify-center space-x-2 text-red-600 text-xs font-bold p-3 bg-red-50 rounded-xl border border-red-100 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </form>

      <div className="text-center pt-2">
        <p className="text-sm text-gray-500 font-bold">
          New to Stratum?{' '}
          <Link href="/signup" className="text-blue-600 hover:text-blue-500 underline underline-offset-4 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Suspense fallback={<div className="animate-pulse text-gray-400 uppercase tracking-widest font-black">Loading Auth...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}
