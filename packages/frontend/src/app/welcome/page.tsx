'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/use-auth';
import { Rocket, LayoutDashboard, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';

export default function WelcomeSelectionPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-6xl w-full grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        
        {/* Onboarding Option */}
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 space-y-8 group hover:scale-[1.02] transition-all flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-100 group-hover:rotate-6 transition-transform mb-8">
              <Rocket className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-tight">Master Organization</h2>
              <p className="text-gray-500 font-medium leading-relaxed text-sm">
                Initialize a full workspace, set up your organizational hierarchy, and invite your first team members.
              </p>
            </div>
            <div className="space-y-3 mt-6">
              {['Setup Hierarchy', 'Configure AI Settings', 'Create Admin Profile'].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Link 
            href="/onboarding?type=organization" 
            className="block w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-center shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <span>Start Onboarding</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Individual Option */}
        <div className="bg-white p-10 rounded-[40px] shadow-2xl border border-gray-100 space-y-8 group hover:scale-[1.02] transition-all flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-100 group-hover:rotate-6 transition-transform mb-8">
              <User className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase leading-tight">Personal Sandbox</h2>
              <p className="text-gray-500 font-medium leading-relaxed text-sm">
                Perfect for solo explorers. Set up a private space to test features before upgrading to a full organization.
              </p>
            </div>
            <div className="space-y-3 mt-6">
              {['Private Memory', 'Personal AI Assistant', 'One-Click Upgrade'].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Link 
            href="/onboarding?type=individual" 
            className="block w-full py-5 bg-emerald-600 text-white rounded-3xl font-black text-center shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
          >
            <span>Launch Sandbox</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Dashboard Option */}
        <div className="bg-gray-900 p-10 rounded-[40px] shadow-2xl space-y-8 group hover:scale-[1.02] transition-all flex flex-col justify-between">
          <div>
            <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-white backdrop-blur-md group-hover:-rotate-6 transition-transform mb-8">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div className="space-y-4">
              <h2 className="text-2xl font-black text-white tracking-tight uppercase leading-tight">Enter Dashboard</h2>
              <p className="text-gray-400 font-medium leading-relaxed text-sm">
                Already have an organization or joined an existing one? Skip setup and jump straight into your workspace.
              </p>
            </div>
            <div className="space-y-3 mt-6">
              {['Live Analytics', 'RAG AI Assistant', 'Knowledge Base'].map((item, i) => (
                <div key={i} className="flex items-center space-x-2 text-[10px] font-black text-white/30 uppercase tracking-widest">
                  <CheckCircle2 className="w-3 h-3 text-blue-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <Link 
            href="/dashboard" 
            className="block w-full py-5 bg-white text-gray-900 rounded-3xl font-black text-center shadow-xl hover:bg-gray-100 transition-all flex items-center justify-center space-x-2"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

      </div>

      <div className="fixed top-12 left-1/2 -translate-x-1/2 flex items-center space-x-2 opacity-20">
        <Layers className="w-6 h-6 text-gray-900" />
        <span className="text-xl font-black tracking-tighter text-gray-900 uppercase">Stratum</span>
      </div>
    </div>
  );
}
