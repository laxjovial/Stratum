'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../hooks/use-auth';
import { 
  ArrowRight, 
  Bot, 
  Network, 
  ShieldCheck, 
  Zap, 
  Layers, 
  BarChart3, 
  Globe, 
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <Layers className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-gray-900">STRATUM</span>
          </Link>

          <div className="hidden md:flex items-center space-x-10 text-sm font-bold text-gray-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <Link href="/ai-assistant" className="hover:text-blue-600 transition-colors">AI Assistant</Link>
            <Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <Link href="/dashboard" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-black text-sm hover:bg-gray-800 transition-all flex items-center space-x-2 shadow-xl shadow-gray-200">
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-6 py-3 text-sm font-black text-gray-500 hover:text-gray-900 transition-colors">Log In</Link>
                <Link href="/signup" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-24 px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100">
              <Zap className="w-3 h-3 mr-2" />
              Next-Gen Org Management
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Visualize your <span className="text-blue-600">Organization</span> like never before.
            </h1>
            
            <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-xl">
              Stratum combines AI-powered knowledge management with dynamic hierarchy visualization. 
              Built for teams that scale, offices that breathe, and clarity that wins.
            </p>

            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 pt-4">
              <Link href={user ? "/dashboard" : "/signup"} className="w-full sm:w-auto px-10 py-5 bg-blue-600 text-white rounded-3xl font-black text-lg hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center space-x-3 group">
                <span>{user ? "Back to Dashboard" : "Start Building Now"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/onboarding" className="w-full sm:w-auto px-10 py-5 bg-white text-gray-900 border-2 border-gray-100 rounded-3xl font-black text-lg hover:border-blue-100 hover:bg-blue-50/50 transition-all flex items-center justify-center">
                Watch Demo
              </Link>
            </div>

            <div className="flex items-center space-x-4 pt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full border-4 border-white bg-gray-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-gray-400">Trusted by <span className="text-gray-900">500+</span> hyper-growth teams</p>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
            {/* Visual placeholder for the Org Web visualizer */}
            <div className="relative z-10 bg-white p-4 rounded-[40px] shadow-2xl border border-gray-100 transform rotate-2">
              <div className="bg-gray-50 rounded-[32px] overflow-hidden aspect-square flex items-center justify-center p-8">
                <div className="relative w-full h-full">
                  {/* Decorative Org Web Visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Network className="w-64 h-64 text-blue-100" />
                  </div>
                  {[
                    { t: '10%', l: '20%', c: 'bg-blue-600', icon: Bot },
                    { t: '50%', l: '80%', c: 'bg-indigo-600', icon: Network },
                    { t: '80%', l: '30%', c: 'bg-emerald-600', icon: ShieldCheck },
                  ].map((p, i) => (
                    <div 
                      key={i} 
                      className={`absolute p-4 rounded-2xl ${p.c} text-white shadow-xl animate-bounce`}
                      style={{ top: p.t, left: p.l, animationDelay: `${i * 0.5}s` }}
                    >
                      <p.icon className="w-6 h-6" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative background elements */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-30" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h2 className="text-sm font-black text-blue-600 uppercase tracking-widest">Built for Performance</h2>
            <h3 className="text-5xl font-black text-gray-900 tracking-tight">Everything you need to run a high-output organization.</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            <Link href="/ai-assistant" className="p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group block">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <Bot className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-4">AI Assistant</h4>
                <p className="text-gray-500 font-medium leading-relaxed">Context-aware intelligence that knows your documentation better than you do.</p>
            </Link>

            {[
              { title: 'Dynamic Hierarchy', desc: 'A living web of your org structure. Map departments, roles, and reporting lines.', icon: Network, color: 'text-indigo-600', bg: 'bg-indigo-100' },
              { title: 'Knowledge Base', desc: 'Secure document management with automatic RAG processing for AI retrieval.', icon: Layers, color: 'text-emerald-600', bg: 'bg-emerald-100' },
              { title: 'Activity Logs', desc: 'Full transparency on workspace output. Monitor progress across all floors.', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-100' },
              { title: 'Enterprise Security', desc: 'Bank-grade encryption and granular role-based access controls.', icon: ShieldCheck, color: 'text-rose-600', bg: 'bg-rose-100' },
              { title: 'Global Payments', desc: 'Pay with Stripe, Stellar, or Paystack. Seamless cross-border billing.', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-100' },
            ].map((f, i) => (
              <div key={i} className="p-10 bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-2 group">
                <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-4">{f.title}</h4>
                <p className="text-gray-500 font-medium leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-gray-900 rounded-[60px] p-16 md:p-24 text-center space-y-10 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight">Ready to map your future?</h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto font-medium">
              Join the future of organizational intelligence. Set up your workspace in less than 5 minutes.
            </p>
            <div className="pt-8">
              <Link href={user ? "/dashboard" : "/signup"} className="px-12 py-6 bg-white text-gray-900 rounded-3xl font-black text-xl hover:bg-gray-100 transition-all shadow-2xl">
                {user ? "Back to Dashboard" : "Get Started for Free"}
              </Link>
            </div>
          </div>
          {/* Background decor */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[120px] opacity-20 -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] opacity-20 translate-y-1/2 -translate-x-1/2" />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-gray-100">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0">
          <Link href="/" className="flex items-center space-x-2">
            <Layers className="text-blue-600 w-6 h-6" />
            <span className="text-xl font-black tracking-tighter">STRATUM</span>
          </Link>
          <p className="text-gray-400 font-bold text-sm">© 2026 Stratum Technologies Inc. All rights reserved.</p>
          <div className="flex space-x-8 text-sm font-bold text-gray-400">
            <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-900 transition-colors">Twitter</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
