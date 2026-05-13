'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi } from '../lib/api';
import { useAuth } from '../hooks/use-auth';
import { Rocket, ArrowRight, Loader2, AlertCircle } from 'lucide-react';

interface ProfileGuardProps {
  children: React.ReactNode;
}

export default function ProfileGuard({ children }: ProfileGuardProps) {
  const { user } = useAuth();
  const api = useApi();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkProfile() {
      if (!user) return;
      
      try {
        setLoading(true);
        const data = await api.get('/auth/me');
        setProfile(data);
        setError(null);
      } catch (err: any) {
        console.error('Profile check failed:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    checkProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Verifying Workspace Identity...</p>
        </div>
      </div>
    );
  }

  // If the backend returns 404, it means the user is authenticated but hasn't completed setup.
  if (error && (error.includes('404') || error.includes('not found'))) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-gray-50 p-6 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-blue-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-blue-200 rotate-3 animate-bounce">
          <Rocket className="w-12 h-12 text-white" />
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Workspace Initialization Required</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Welcome to Stratum! Your authentication was successful, but we haven't found a workspace profile for you yet.
          </p>
        </div>
        <div className="bg-white p-8 rounded-[32px] border border-gray-200 shadow-sm space-y-4 w-full max-w-sm text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Next Step</p>
            <Link 
              href="/onboarding" 
              className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center justify-center space-x-3 group"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
            </Link>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Setup takes less than 60 seconds</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center space-y-6 bg-red-50/30 p-6">
        <div className="p-4 bg-red-100 text-red-600 rounded-3xl">
          <AlertCircle className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Connection Error</h3>
          <p className="text-gray-500 font-medium max-w-xs">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
