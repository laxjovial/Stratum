'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../lib/api';
import { Bot, AlertTriangle, CheckCircle, Info, Sparkles, ArrowRight, Loader2, UserMinus, Activity, Database } from 'lucide-react';
import Link from 'next/link';

interface AuditResult {
    status: string;
    lonely_employees: any[];
    overloaded_managers: any[];
    knowledge_gaps: any[];
    recommendations: string[];
}

export default function ButlerInsights() {
    const api = useApi();
    const [audit, setAudit] = useState<AuditResult | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function runAudit() {
            try {
                const profile = await api.get('/auth/me');
                if (profile.organization_id) {
                    const result = await api.get(`/analytics/audit/${profile.organization_id}`);
                    setAudit(result);
                }
            } catch (err) {
                console.error("Butler Audit Failed:", err);
            } finally {
                setLoading(false);
            }
        }
        runAudit();
    }, [api]);

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-4 h-[400px]">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Butler is patrolling your hierarchy...</p>
            </div>
        );
    }

    if (!audit) return null;

    return (
        <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden animate-in fade-in slide-in-from-right-8 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-blue-900 p-8 text-white relative">
                <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl">
                            <Bot className="w-8 h-8 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Robotic Butler</h2>
                            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em]">Live Structural Sentinel</p>
                        </div>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 ${
                        audit.status === 'Healthy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${audit.status === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <span>System {audit.status}</span>
                    </div>
                </div>
                
                {/* Decorative Background Icon */}
                <Sparkles className="absolute right-4 top-4 w-32 h-32 text-white/5 pointer-events-none" />
            </div>

            <div className="p-8 space-y-8">
                {/* Proactive Recommendations */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center space-x-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        <span>Current Recommendations</span>
                    </h3>
                    <div className="space-y-3">
                        {audit.recommendations.map((rec, i) => (
                            <div key={i} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-blue-200 transition-colors">
                                <Sparkles className="w-5 h-5 text-blue-500 mt-0.5" />
                                <p className="text-sm font-bold text-gray-700 leading-relaxed">{rec}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Audit Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Lonely Employees */}
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <UserMinus className="w-6 h-6 text-amber-500" />
                            <span className="text-2xl font-black text-gray-900">{audit.lonely_employees.length}</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Lonely Nodes</p>
                        {audit.lonely_employees.length > 0 && (
                            <button 
                                onClick={async () => {
                                    for (const u of audit.lonely_employees) {
                                        await api.post(`/users/${u.id}/auto-assign-manager`);
                                    }
                                    window.location.reload();
                                }}
                                className="w-full py-2 bg-amber-500/10 text-amber-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all"
                            >
                                Repair All
                            </button>
                        )}
                    </div>

                    {/* Overloaded */}
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <Activity className="w-6 h-6 text-red-500" />
                            <span className="text-2xl font-black text-gray-900">{audit.overloaded_managers.length}</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Burnout Risks</p>
                    </div>

                    {/* Gaps */}
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 space-y-4">
                        <div className="flex items-center justify-between">
                            <Database className="w-6 h-6 text-blue-500" />
                            <span className="text-2xl font-black text-gray-900">{audit.knowledge_gaps.length}</span>
                        </div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Knowledge Gaps</p>
                    </div>
                </div>

                <Link 
                    href="/dashboard/hierarchy" 
                    className="flex items-center justify-center space-x-3 w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all group shadow-xl"
                >
                    <span>Reconfigure Org Web</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
