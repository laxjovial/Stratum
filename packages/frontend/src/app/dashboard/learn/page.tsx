'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '../../../lib/api';
import { BookOpen, ArrowRight, Loader2, Plus, Clock, User } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  content: string;
  created_at: string;
  author_id: string;
}

export default function LearnPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    async function fetchLessons() {
      try {
        const data = await api.get('/lessons/');
        setLessons(data);
      } catch (err) {
        console.error('Failed to fetch lessons:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLessons();
  }, []);

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
          <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Training Center</h1>
          <p className="text-gray-500 font-medium italic">Master your role with AI-curated training modules.</p>
        </div>
        <Link 
          href="/dashboard/content/builder" 
          className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-100"
        >
          <Plus className="w-4 h-4" /> Create Lesson
        </Link>
      </div>

      {lessons.length === 0 ? (
        <div className="bg-white p-16 rounded-[40px] border border-gray-100 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
            <BookOpen className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-gray-900">No training modules yet</h3>
            <p className="text-gray-500 font-medium max-w-sm mx-auto">
              Your organization hasn't published any training content. Use the Content Builder to create your first lesson.
            </p>
          </div>
          <Link 
            href="/dashboard/content/builder" 
            className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700"
          >
            <span>Open Content Builder</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lessons.map((lesson) => (
            <Link 
              key={lesson.id} 
              href={`/dashboard/learn/lesson/${lesson.id}`}
              className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group block"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active</span>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-black text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                    {lesson.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-medium line-clamp-2 leading-relaxed">
                    {lesson.content.substring(0, 100)}...
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <Clock className="w-3 h-3" /> 5 min
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <User className="w-3 h-3" /> {lesson.author_id.substring(0, 5)}
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
