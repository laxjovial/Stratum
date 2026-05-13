'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../../lib/api';
import Link from 'next/link';
import { useAuth } from '../../../hooks/use-auth';
import { MessageSquare, Plus, ArrowRight, Loader2, Clock, User, Hash } from 'lucide-react';

interface Thread {
    id: string;
    title: string;
    created_at: string;
}

export default function ForumsListPage() {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const api = useApi();

    useEffect(() => {
        const fetchThreads = async () => {
            if (!user) return;

            try {
                const profile = await api.get('/auth/me');
                if (profile.organization_id) {
                    const data = await api.get(`/forums/organization/${profile.organization_id}/threads`);
                    setThreads(data);
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Community Forums</h1>
                    <p className="text-gray-500 font-medium italic">Collaborate and discuss across the organization.</p>
                </div>
                <Link 
                    href="/dashboard/forums/new" 
                    className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-100"
                >
                    <Plus className="w-4 h-4" /> Create Thread
                </Link>
            </div>

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold">
                    Error: {error}
                </div>
            )}

            {threads.length === 0 ? (
                <div className="bg-white p-16 rounded-[40px] border border-gray-100 shadow-sm text-center space-y-6">
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                        <MessageSquare className="w-10 h-10" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-gray-900">No discussions yet</h3>
                        <p className="text-gray-500 font-medium max-w-sm mx-auto">
                            Be the first to start a conversation in your organization.
                        </p>
                    </div>
                    <Link 
                        href="/dashboard/forums/new" 
                        className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700"
                    >
                        <span>Start a Thread</span>
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {threads.map((thread) => (
                        <Link 
                            key={thread.id} 
                            href={`/dashboard/forums/${thread.id}`}
                            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group block"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                                        <MessageSquare className="w-6 h-6" />
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                        <Hash className="w-3 h-3" /> {thread.id.substring(0, 4)}
                                    </div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                    {thread.title}
                                </h3>

                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                            <Clock className="w-3 h-3" /> {new Date(thread.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
