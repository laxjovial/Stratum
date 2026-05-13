'use client';

import React, { useState } from 'react';
import { useApi } from '../lib/api';
import { Zap, X, Loader2, Building2, LayoutGrid, CheckCircle2 } from 'lucide-react';

interface CreateDepartmentModalProps {
    organizationId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (newDept: any) => void;
}

export default function CreateDepartmentModal({ 
    organizationId, 
    isOpen, 
    onClose, 
    onSuccess 
}: CreateDepartmentModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    
    const api = useApi();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await api.post(`/departments/${organizationId}`, {
                name,
                description
            });
            setIsSuccess(true);
            setTimeout(() => {
                onSuccess(result);
                setName('');
                setDescription('');
                setIsSuccess(false);
                onClose();
            }, 1500);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl border border-white/20 overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
                
                {/* Header */}
                <div className="bg-gray-900 p-8 text-white flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10 space-y-1">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-600 rounded-xl">
                                <Building2 className="w-4 h-4 text-white" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight">New Department</h2>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest opacity-80">Expand your organizational web</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    <LayoutGrid className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5 rotate-12" />
                </div>

                {/* Body */}
                <div className="p-8 space-y-6">
                    {isSuccess ? (
                        <div className="py-12 text-center space-y-4 animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-500 text-white rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 uppercase">Department Created</h3>
                            <p className="text-gray-500 font-medium italic">Your organization just got a little bigger.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department Name</label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. Engineering, Product, HR"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm"
                                        required
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description (Optional)</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="What does this team focus on?"
                                        rows={3}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm resize-none"
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2 animate-shake">
                                    <Zap className="w-4 h-4" /> {error}
                                </div>
                            )}

                            <div className="flex gap-4 pt-2">
                                <button 
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 bg-gray-50 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    <span>Establish Department</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                    <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">Stratum Organizational Infrastructure Tool</p>
                </div>
            </div>
        </div>
    );
}
