'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../hooks/use-auth';
import { useApi } from '../../lib/api';
import { Users, FileText, MessageSquare, BookOpen, TrendingUp, ShieldCheck, Rocket, ArrowRight, Loader2 } from 'lucide-react';
import ButlerInsights from '../../components/ButlerInsights';

interface AnalyticsSummary {
  user_count: number;
  document_count: number;
  thread_count: number;
  lesson_count: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const api = useApi();
  const router = useRouter();
  const [stats, setStats] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // 1. Get user profile to find organization_id
      const profile = await api.get('/auth/me');
      
      // 2. Fetch analytics using org ID
      if (profile.organization_id) {
        const summary = await api.get(`/analytics/summary/${profile.organization_id}`);
        setStats(summary);
      }
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const statCards = [
    { label: 'Total Members', value: stats?.user_count ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Knowledge Assets', value: stats?.document_count ?? 0, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Forum Activity', value: stats?.thread_count ?? 0, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Training Modules', value: stats?.lesson_count ?? 0, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error && error.includes('404')) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 bg-blue-600 rounded-[40px] flex items-center justify-center shadow-2xl shadow-blue-200 rotate-3 animate-bounce">
          <Rocket className="w-12 h-12 text-white" />
        </div>
        <div className="text-center space-y-3 max-w-md">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Initialization Required</h2>
          <p className="text-gray-500 font-medium leading-relaxed">
            Welcome to Stratum! Your account is active, but we need to initialize your workspace before you can access the dashboard.
          </p>
        </div>
        <Link 
          href="/onboarding" 
          className="px-10 py-5 bg-gray-900 text-white rounded-3xl font-black text-lg hover:bg-gray-800 transition-all shadow-xl shadow-gray-200 flex items-center space-x-3 group"
        >
          <span>Start Workspace Setup</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </Link>
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">Setup takes less than 60 seconds</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex justify-between items-center overflow-hidden relative">
        <div className="space-y-2 relative z-10">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Welcome back, <span className="text-blue-600">{user?.displayName || user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-gray-500 font-medium max-w-md">
            Here's what's happening in your organization today.
          </p>
        </div>
        <div className="hidden md:flex space-x-2 opacity-10 absolute -right-4 top-0 pointer-events-none">
          <TrendingUp className="w-48 h-48 text-blue-500" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Live</span>
            </div>
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-gray-900">
                {isLoading ? (
                  <div className="h-8 w-12 bg-gray-100 animate-pulse rounded-lg" />
                ) : stat.value}
              </h3>
              <p className="text-sm font-bold text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Butler & Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <ButlerInsights />
        </div>

        <div className="space-y-8">
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Command Actions</h2>
                <div className="space-y-4">
                    <Link href="/dashboard/content/builder" className="flex items-center p-4 bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl transition-colors group text-left">
                        <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:text-blue-600">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">Upload Knowledge</p>
                            <p className="text-xs text-gray-500">Train the Butler</p>
                        </div>
                    </Link>
                    <Link href="/dashboard/hierarchy" className="flex items-center p-4 bg-gray-50 hover:bg-emerald-50 border border-gray-100 rounded-2xl transition-colors group text-left">
                        <div className="p-3 bg-white rounded-xl shadow-sm mr-4 group-hover:text-emerald-600">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">Manage Network</p>
                            <p className="text-xs text-gray-500">Edit Hierarchy</p>
                        </div>
                    </Link>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[40px] shadow-xl text-white space-y-6 relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                    <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                        <ShieldCheck className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-black leading-tight">Security</h2>
                    <p className="text-blue-100 text-sm font-medium leading-relaxed">
                        Superior Priority is active. Review your audit logs.
                    </p>
                    <Link href="/dashboard/logs" className="block w-full py-4 bg-white text-blue-700 rounded-2xl font-black text-sm shadow-lg hover:bg-blue-50 transition-colors text-center">
                        Audit Logs
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
