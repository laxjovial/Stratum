'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';
import { useApi } from '../../lib/api';
import { ShieldCheck, User, Lock, Loader2, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { AuthInput } from '../../components/AuthInput';
import { LoadingButton } from '../../components/LoadingButton';
import { zxcvbn } from '@zxcvbn-ts/core';

export default function ClaimKeyPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();
  const { signup } = useAuth();
  const api = useApi();

  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token found. Please check your link.');
      setIsLoading(false);
      return;
    }

    const verifyToken = async () => {
      try {
        const details = await api.get(`/users/invite/${token}`);
        setInviteDetails(details);
      } catch (err: any) {
        setError(err.message || 'This Stratum Key is invalid or has expired.');
      } finally {
        setIsLoading(false);
      }
    };

    verifyToken();
  }, [token, api]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Create the Auth Account (Firebase/Supabase)
      const authResult = await signup(inviteDetails.email, password);
      
      // 2. Claim the Seat in Stratum
      await api.post('/users/claim-key', {
        token: token,
        firebase_uid: authResult.uid,
        full_name: fullName
      });

      // 3. Success!
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 space-y-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Authenticating Stratum Key...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-10 rounded-[40px] shadow-2xl border border-red-50 text-center space-y-8 animate-in zoom-in duration-500">
            <div className="inline-flex p-5 bg-red-50 text-red-600 rounded-3xl">
                <AlertCircle className="w-10 h-10" />
            </div>
            <div className="space-y-2">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Invalid Key</h2>
                <p className="text-gray-500 font-medium">{error}</p>
            </div>
            <button 
                onClick={() => router.push('/welcome')}
                className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
            >
                Return to Safety
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-xl w-full bg-white p-12 rounded-[40px] shadow-2xl border border-gray-100 space-y-10 animate-in slide-in-from-bottom-8 duration-700">
        
        <div className="text-center space-y-4">
            <div className="inline-flex p-5 bg-blue-600 text-white rounded-3xl shadow-xl shadow-blue-100 mb-2">
                <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">You're Invited</h1>
            <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-black text-blue-700 uppercase tracking-tight">{inviteDetails.organization_name}</span>
                </div>
                <p className="text-gray-400 font-medium">As a <span className="text-gray-900 font-bold">{inviteDetails.role_name}</span></p>
            </div>
        </div>

        <form onSubmit={handleClaim} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Confirm Identity</label>
                    <div className="px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-gray-400 font-bold text-sm">
                        {inviteDetails.email}
                    </div>
                </div>

                <AuthInput
                    label="Full Name"
                    placeholder="Enter your professional name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                />

                <AuthInput
                    label="Set Password"
                    type="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
            </div>

            <LoadingButton
                type="submit"
                isLoading={isSubmitting}
            >
                Secure Account & Enter Dashboard
            </LoadingButton>
        </form>

        <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
          Stratum Cryptographic Handshake Active
        </p>
      </div>
    </div>
  );
}
