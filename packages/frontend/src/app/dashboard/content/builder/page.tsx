'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../../../../lib/api';
import { 
  Sparkles, 
  BookOpen, 
  Users, 
  FileText, 
  Plus, 
  ArrowRight, 
  Loader2, 
  ShieldCheck,
  ChevronDown,
  Layers,
  Zap
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
}

interface Document {
  id: string;
  file_name: string;
  section: string;
}

export default function LessonBuilderPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [targetDept, setTargetDept] = useState('');
    const [departments, setDepartments] = useState<Department[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocs, setSelectedDocs] = useState<string[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const router = useRouter();
    const api = useApi();

    useEffect(() => {
        async function loadData() {
            try {
                const profile = await api.get('/auth/me');
                const [depts, docs] = await Promise.all([
                    api.get(`/departments/${profile.organization_id}`),
                    api.get(`/documents/${profile.organization_id}`)
                ]);
                setDepartments(depts);
                setDocuments(docs);
            } catch (e) {
                console.error("Failed to load builder context:", e);
            }
        }
        loadData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const newLesson = await api.post('/lessons/', { 
                title, 
                content,
                target_department_id: targetDept || null 
            });
            router.push(`/dashboard/learn`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerate = async () => {
        if (!title) {
            setError("Please provide a title or topic first.");
            return;
        }
        setIsGenerating(true);
        setError(null);

        try {
            const generated = await api.post('/lessons/generate', {
                title,
                topic: title,
                target_department_id: targetDept || null,
                document_ids: selectedDocs
            });
            setContent(generated.content);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                        <div className="p-2 bg-blue-600 rounded-lg text-white">
                            <BookOpen className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Content Builder</h1>
                    </div>
                    <p className="text-gray-500 font-medium italic">Create targeted training assets using Workspace Intelligence.</p>
                </div>

                <div className="flex items-center space-x-3 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Superior Priority Active</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" /> Lesson Settings
                            </h2>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Department</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <select 
                                        value={targetDept}
                                        onChange={(e) => setTargetDept(e.target.value)}
                                        className="w-full pl-12 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white transition-all font-bold text-sm appearance-none"
                                    >
                                        <option value="">Entire Organization</option>
                                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Contextual Sources</label>
                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                                    {documents.map(doc => (
                                        <button 
                                            key={doc.id}
                                            onClick={() => setSelectedDocs(prev => prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id])}
                                            className={`w-full p-3 rounded-xl flex items-center space-x-3 border transition-all text-left ${
                                                selectedDocs.includes(doc.id) ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-white'
                                            }`}
                                        >
                                            <FileText className={`w-3 h-3 ${selectedDocs.includes(doc.id) ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className="text-[10px] font-bold text-gray-700 truncate">{doc.file_name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !title}
                            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-gray-100 disabled:opacity-50"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            AI Draft from Context
                        </button>
                    </div>

                    <div className="bg-blue-600 p-8 rounded-[40px] text-white space-y-4 shadow-xl shadow-blue-100 relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-black tracking-tight mb-2">Trickle-Down Knowledge</h3>
                            <p className="text-sm text-blue-100 font-medium leading-relaxed">
                                Content created here is automatically pushed to the training dashboards of the targeted department subordinates.
                            </p>
                        </div>
                        <Layers className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10" />
                    </div>
                </div>

                {/* Editor Area */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Lesson Master Title</label>
                            <input 
                                type="text" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Enter title or topic for AI generation..."
                                className="w-full px-8 py-5 bg-gray-50 border border-gray-100 rounded-3xl text-lg font-black focus:bg-white focus:ring-8 focus:ring-blue-50/50 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Curated Content (Markdown)</label>
                            <textarea 
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={15}
                                placeholder="Edit the AI draft or write original content here..."
                                className="w-full px-8 py-6 bg-gray-50 border border-gray-100 rounded-[32px] text-sm font-medium leading-relaxed focus:bg-white focus:ring-8 focus:ring-blue-50/50 outline-none transition-all scrollbar-hide"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" /> {error}
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <button 
                                type="button" 
                                onClick={() => router.back()}
                                className="px-8 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={isLoading}
                                className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Publish Content
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

function AlertCircle({ className }: { className?: string }) {
    return <Zap className={className} />;
}
