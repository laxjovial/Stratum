'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../../lib/api';
import { useAuth } from '../../../hooks/use-auth';
import { 
  Users, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  TrendingUp, 
  Loader2, 
  ArrowRight,
  Target,
  Activity,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface AnalyticsSummary {
    user_count: number;
    document_count: number;
    thread_count: number;
    lesson_count: number;
}

export default function AnalyticsPage() {
    const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const api = useApi();

    useEffect(() => {
        const fetchAnalytics = async () => {
            if (!user) return;

            try {
                const profile = await api.get('/auth/me');
                if (profile.organization_id) {
                    const data = await api.get(`/analytics/summary/${profile.organization_id}`);
                    setSummary(data);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, [user]);

    const statCards = [
        { label: 'Total Members', value: summary?.user_count ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Knowledge Assets', value: summary?.document_count ?? 0, icon: FileText, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Forum Discussions', value: summary?.thread_count ?? 0, icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Training Modules', value: summary?.lesson_count ?? 0, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div className="space-y-2">
                    <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        <Activity className="w-3 h-3 mr-2" />
                        Live Intelligence
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Organizational Analytics</h1>
                    <p className="text-gray-500 font-medium italic max-w-xl">
                        Deep insights into your organization's growth, knowledge distribution, and community engagement.
                    </p>
                </div>
                
                <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">System Status</p>
                        <p className="text-sm font-black text-emerald-500 uppercase">Operational</p>
                    </div>
                    <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, idx) => (
                    <div 
                        key={idx} 
                        className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <TrendingUp className="w-5 h-5 text-gray-100 group-hover:text-emerald-500 transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
                                {stat.value}
                            </h3>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Insights Placeholder */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-10 rounded-[50px] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="space-y-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">Growth Projection</h2>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-widest">Q2 Forecast</span>
                        </div>
                        
                        <div className="aspect-[21/9] bg-gray-50 rounded-[32px] flex items-center justify-center border-2 border-dashed border-gray-100 group-hover:border-blue-100 transition-colors">
                            <div className="text-center space-y-4">
                                <Activity className="w-12 h-12 text-gray-200 mx-auto" />
                                <p className="text-sm font-bold text-gray-300 uppercase tracking-widest">Advanced Visualizations Loading...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-gray-900 p-10 rounded-[50px] text-white space-y-6 shadow-2xl relative overflow-hidden">
                        <div className="relative z-10 space-y-4">
                            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl w-fit">
                                <Target className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-black leading-tight uppercase tracking-tight">KPI Sentinel</h2>
                            <p className="text-gray-400 text-sm font-medium leading-relaxed">
                                Your organization is currently operating at <span className="text-white font-bold">92% capacity</span>. Training completion is up 14% this month.
                            </p>
                            <Link href="/dashboard/logs" className="flex items-center justify-between w-full p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group">
                                <span className="text-xs font-black uppercase tracking-widest">View Detailed Logs</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <Zap className="absolute -bottom-8 -right-8 w-40 h-40 text-blue-500 opacity-5" />
                    </div>

                    <div className="bg-blue-600 p-10 rounded-[50px] text-white shadow-xl shadow-blue-100 relative overflow-hidden">
                        <div className="relative z-10 space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Intelligence Status</p>
                            <h3 className="text-xl font-black">RAG Neural Index: 100%</h3>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="p-6 bg-red-50 border border-red-100 rounded-3xl text-red-600 text-sm font-bold flex items-center gap-3">
                    <Zap className="w-5 h-5" />
                    <span>Data Synchronization Error: {error}</span>
                </div>
            )}
        </div>
    );
}
