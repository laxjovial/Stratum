'use client';

import React from 'react';
import Link from 'next/link';
import { Bot, MessageSquare, Sparkles, Zap, Shield, Search, ArrowRight, Layers } from 'lucide-react';

export default function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Simple Nav */}
      <nav className="h-20 border-b border-gray-100 flex items-center justify-between px-6 max-w-7xl mx-auto w-full">
        <Link href="/" className="flex items-center space-x-2">
          <Layers className="text-blue-600 w-6 h-6" />
          <span className="text-xl font-black tracking-tighter">STRATUM</span>
        </Link>
        <Link href="/signup" className="px-6 py-2 bg-blue-600 text-white rounded-xl font-black text-sm shadow-lg shadow-blue-100">
          Get Started
        </Link>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 space-y-32">
        {/* Hero */}
        <section className="text-center space-y-8">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
            <Sparkles className="w-3 h-3 mr-2" />
            Stratum Intelligence
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tight leading-[1.1]">
            Meet your organization's <br />
            <span className="text-blue-600">Cognitive Core.</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            Our AI Assistant doesn't just "chat." It understands your entire organizational context, 
            from strategy PDFs to technical documentation.
          </p>
        </section>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-12">
          {[
            { 
              title: 'Context-Aware RAG', 
              desc: 'Using Retrieval-Augmented Generation, the assistant searches your private knowledge base to provide answers backed by your own data.',
              icon: Search,
              color: 'bg-blue-600'
            },
            { 
              title: 'Zero Hallucinations', 
              desc: 'If the information isn\'t in your documents, Stratum tells you. No more guessing, just verified workspace intelligence.',
              icon: Shield,
              color: 'bg-emerald-600'
            },
            { 
              title: 'Real-time Processing', 
              desc: 'Upload a document and it\'s ready for query in seconds. Our automated pipeline handles chunking and vectorization instantly.',
              icon: Zap,
              color: 'bg-amber-600'
            },
            { 
              title: 'Collaborative Memory', 
              desc: 'The assistant learns from your team\'s collective knowledge, breaking down silos and ensuring everyone has the right answer.',
              icon: MessageSquare,
              color: 'bg-indigo-600'
            }
          ].map((f, i) => (
            <div key={i} className="p-10 bg-gray-50 rounded-[40px] space-y-6 group hover:bg-white hover:shadow-2xl hover:shadow-blue-100 transition-all border border-transparent hover:border-blue-100">
              <div className={`w-14 h-14 rounded-2xl ${f.color} text-white flex items-center justify-center shadow-lg`}>
                <f.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-black">{f.title}</h3>
              <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Final CTA */}
        <section className="bg-gray-900 rounded-[60px] p-16 text-center space-y-8 relative overflow-hidden">
           <div className="relative z-10 space-y-6">
              <h2 className="text-4xl md:text-5xl font-black text-white">Ready for a smarter workspace?</h2>
              <p className="text-gray-400 max-w-xl mx-auto font-medium">Experience the power of Gemini-backed intelligence integrated directly into your workflow.</p>
              <div className="pt-4">
                 <Link href="/signup" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all inline-flex items-center space-x-2">
                    <span>Try AI Assistant</span>
                    <ArrowRight className="w-4 h-4" />
                 </Link>
              </div>
           </div>
           <Bot className="absolute -bottom-10 -right-10 w-64 h-64 text-white opacity-5 rotate-12" />
        </section>
      </main>

      <footer className="py-20 px-6 border-t border-gray-100 text-center text-sm font-bold text-gray-400">
        © 2026 Stratum Technologies Inc.
      </footer>
    </div>
  );
}
