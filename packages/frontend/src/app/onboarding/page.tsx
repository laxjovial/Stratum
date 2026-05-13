'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../../lib/api';
import { useAuth } from '../../hooks/use-auth';
import { Building2, User, ArrowRight, Loader2, Rocket } from 'lucide-react';
import { LoadingButton } from '../../components/LoadingButton';
import { useSearchParams } from 'next/navigation';

export default function OnboardingPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'organization';
  
  const [orgName, setOrgName] = useState(type === 'individual' ? 'Personal Sandbox' : '');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const api = useApi();
  const { user } = useAuth();

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await api.post('/setup/first-user', {
        organization_name: orgName,
        user_full_name: fullName,
        setup_type: type
      });
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg p-10 space-y-8 bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-3">
          <div className="inline-flex p-4 bg-blue-600 rounded-3xl shadow-lg shadow-blue-100 mb-4">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            {type === 'individual' ? 'Welcome!' : 'Final Step'}
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed max-w-sm mx-auto">
            {type === 'individual' 
              ? "Let's set up your private sandbox environment." 
              : "Let's set up your organization space and finalize your profile."}
          </p>
        </div>

        <form onSubmit={handleSetup} className="space-y-6">
          <div className="space-y-4">
            {type !== 'individual' && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Organization Name</label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-gray-400 ml-1">Your Full Name</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <LoadingButton
              type="submit"
              isLoading={isLoading}
            >
              Finish Setup & Launch Dashboard
            </LoadingButton>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold text-center animate-in zoom-in duration-300">
              {error}
            </div>
          )}
        </form>

        <p className="text-center text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
          Powered by Stratum Core
        </p>
      </div>
    </div>
  );
}
