'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useApi } from '../lib/api';
import { 
  User, 
  Shield, 
  Map, 
  ChevronRight, 
  MoreHorizontal, 
  Users, 
  Mail, 
  UserPlus,
  Briefcase,
  Zap
} from 'lucide-react';
import CreateDepartmentModal from './CreateDepartmentModal';

interface NetworkUser {
  id: string;
  full_name: string;
  email: string;
  role?: { name: string };
  department?: { name: string };
  manager_id?: string;
}

export default function MemberNetwork() {
  const [network, setNetwork] = useState<NetworkUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<any | null>(null);
  const [isDeptModalOpen, setIsDeptModalOpen] = useState(false);
  const api = useApi();

  useEffect(() => {
    async function loadNetwork() {
      try {
        const [myProfile, members] = await Promise.all([
          api.get('/users/me'),
          api.get('/users/network')
        ]);
        setMe(myProfile);
        setNetwork(members);
      } catch (e) {
        console.error("Network load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadNetwork();
  }, []);

  if (loading) return <div className="p-20 text-center animate-pulse text-gray-400 font-black uppercase">Mapping Organizational Web...</div>;

  return (
    <>
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Leadership Profile Summary */}
      <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <Shield className="w-48 h-48 text-blue-600" />
        </div>
        
        <div className="relative">
            <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-blue-200">
                <User className="w-12 h-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-xl text-white shadow-lg border-4 border-white">
                <Shield className="w-4 h-4" />
            </div>
        </div>

        <div className="space-y-2 text-center md:text-left flex-grow">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">{me?.full_name || 'Organization Head'}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <span className="flex items-center gap-1.5 text-xs font-black text-blue-600 uppercase tracking-widest px-3 py-1 bg-blue-50 rounded-full">
                    <Briefcase className="w-3 h-3" /> {me?.role?.name || 'Administrator'}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-black text-gray-400 uppercase tracking-widest px-3 py-1 bg-gray-50 rounded-full">
                    <Users className="w-3 h-3" /> {network.length} Subordinates in Network
                </span>
            </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
            <button 
                onClick={() => setIsDeptModalOpen(true)}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center gap-2 shadow-xl shadow-blue-100"
            >
                <Zap className="w-4 h-4" /> Create Dept
            </button>
            <Link 
                href="/dashboard/hierarchy/invite"
                className="px-8 py-4 bg-gray-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl shadow-gray-100"
            >
                <UserPlus className="w-4 h-4" /> Add Member
            </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Network Connections */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between px-4">
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest">Employee Network Web</h2>
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Connections</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {network.map((member) => (
                    <div key={member.id} className="bg-white p-6 rounded-[32px] border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all group">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <User className="w-6 h-6" />
                            </div>
                            <button className="p-2 text-gray-300 hover:text-gray-600">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-black text-gray-900 truncate">{member.full_name}</h3>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {member.email}
                            </p>
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">
                                {member.role?.name || 'Staff'}
                            </span>
                            <button className="text-[10px] font-black text-gray-300 uppercase tracking-widest flex items-center hover:text-blue-600 transition-all">
                                Details <ChevronRight className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Hierarchy Context */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-blue-600 p-10 rounded-[50px] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-blue-200">
                <div className="relative z-10">
                    <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">Superior Insights</h3>
                    <p className="text-sm text-blue-100 font-medium leading-relaxed">
                        You are viewing your organizational reporting line. As a superior, you have priority control over assets created by these members.
                    </p>
                </div>
                <div className="pt-6 border-t border-blue-500/50 relative z-10 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-60">Reach</p>
                        <p className="text-xl font-black">{network.length} levels</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                        <p className="text-xl font-black">Authorized</p>
                    </div>
                </div>
                <Map className="absolute -bottom-8 -right-8 w-40 h-40 opacity-10" />
            </div>

            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-4">
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Admin Actions</h4>
                <div className="space-y-2">
                    <button className="w-full p-4 bg-gray-50 rounded-2xl text-left text-xs font-black text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-between">
                        Reconfigure Web <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                    <button className="w-full p-4 bg-gray-50 rounded-2xl text-left text-xs font-black text-gray-700 hover:bg-gray-100 transition-all flex items-center justify-between">
                        Security Audit <ChevronRight className="w-4 h-4 text-gray-300" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
    
    {me?.organization_id && (
        <CreateDepartmentModal 
            organizationId={me.organization_id}
            isOpen={isDeptModalOpen}
            onClose={() => setIsDeptModalOpen(false)}
            onSuccess={() => {
                // Optionally refresh or show toast
                console.log("Department created successfully");
            }}
        />
    )}
    </>
  );
}
