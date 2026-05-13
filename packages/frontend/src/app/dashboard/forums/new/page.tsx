'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../../../../lib/api';
import Link from 'next/link';
import { MessageSquare, ArrowLeft, Plus, Loader2, Zap } from 'lucide-react';

export default function NewThreadPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const api = useApi();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const newThread = await api.post('/forums/threads', {
                title,
                first_post_content: content,
                department_id: null,
            });
            router.push(`/dashboard/forums/${newThread.id}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-4">
                <Link href="/dashboard/forums" className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Forums</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-xl">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Start New Discussion</h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                <div className="space-y-2">
                    <label htmlFor="title" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        Thread Subject
                    </label>
                    <input
                        id="title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-lg font-black focus:bg-white focus:ring-8 focus:ring-blue-50/50 outline-none transition-all"
                        placeholder="What should we discuss?"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="content" className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                        First Post Content
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={8}
                        required
                        className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[32px] text-sm font-medium leading-relaxed focus:bg-white focus:ring-8 focus:ring-blue-50/50 outline-none transition-all scrollbar-hide"
                        placeholder="Provide details and start the conversation..."
                    />
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4" /> {error}
                    </div>
                )}

                <div className="flex justify-end gap-4">
                    <Link 
                        href="/dashboard/forums"
                        className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                    >
                        Cancel
                    </Link>
                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        <span>Create Thread</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
