'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApi } from '../../../../lib/api';
import { UserPlus, ArrowLeft, Loader2, Mail, Briefcase, Users, Zap, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Role {
    id: string;
    name: string;
}

interface Department {
    id: string;
    name: string;
}

interface User {
    id: string;
    full_name: string;
}

export default function InviteMemberPage() {
    const [email, setEmail] = useState('');
    const [roleId, setRoleId] = useState('');
    const [deptId, setDeptId] = useState('');
    const [managerId, setManagerId] = useState('');
    
    const [roles, setRoles] = useState<Role[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [managers, setManagers] = useState<User[]>([]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitedUser, setInvitedUser] = useState<any | null>(null);

    const router = useRouter();
    const api = useApi();

    useEffect(() => {
        async function loadContext() {
            try {
                const profile = await api.get('/auth/me');
                if (profile.organization_id) {
                    const [rolesData, deptsData, membersData] = await Promise.all([
                        api.get(`/organizations/${profile.organization_id}/roles`),
                        api.get(`/departments/${profile.organization_id}`),
                        api.get(`/users/organization/${profile.organization_id}`)
                    ]);
                    setRoles(rolesData);
                    setDepartments(deptsData);
                    setManagers(membersData);
                    
                    // Set defaults
                    if (rolesData.length > 0) setRoleId(rolesData[0].id);
                    setManagerId(profile.id);
                }
            } catch (err) {
                console.error("Failed to load invite context:", err);
            } finally {
                setIsFetching(false);
            }
        }
        loadContext();
    }, []);

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await api.post('/users/invite', {
                email,
                role_id: roleId,
                department_id: deptId || null,
                manager_id: managerId || null,
                expires_in_hours: 48
            });
            setInvitedUser(result);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (invitedUser) {
        return (
            <div className="max-w-2xl mx-auto py-20 animate-in fade-in zoom-in duration-700">
                <div className="bg-white p-12 rounded-[50px] border border-gray-100 shadow-2xl text-center space-y-8">
                    <div className="w-24 h-24 bg-emerald-500 text-white rounded-[32px] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
                        <CheckCircle className="w-12 h-12" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Stratum Key Generated</h2>
                        <p className="text-gray-500 font-medium leading-relaxed">
                            A secure invitation has been created for <span className="text-gray-900 font-bold">{invitedUser.email}</span>.
                            They can now claim their seat in the organization.
                        </p>
                    </div>
                    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Secure Handshake Token</p>
                        <code className="text-xs font-black text-blue-600 break-all bg-white px-4 py-2 rounded-xl block border border-gray-100">
                            {invitedUser.invitation_token || 'Token generated successfully'}
                        </code>
                    </div>
                    <button 
                        onClick={() => router.push('/dashboard/hierarchy')}
                        className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl"
                    >
                        Back to Org Web
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="space-y-4">
                <Link href="/dashboard/hierarchy" className="inline-flex items-center space-x-2 text-blue-600 font-black uppercase tracking-widest text-xs hover:text-blue-700 group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span>Back to Org Web</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-xl">
                        <UserPlus className="w-6 h-6" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight uppercase">Invite Staff Member</h1>
                </div>
            </div>

            <form onSubmit={handleInvite} className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none transition-all font-bold text-sm"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Role</label>
                            <div className="relative">
                                <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    value={roleId}
                                    onChange={(e) => setRoleId(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none appearance-none transition-all font-bold text-sm"
                                    required
                                >
                                    <option value="" disabled>Select Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                            <div className="relative">
                                <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    value={deptId}
                                    onChange={(e) => setDeptId(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none appearance-none transition-all font-bold text-sm"
                                >
                                    <option value="">No Specific Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Reporting Line (Manager)</label>
                            <div className="relative">
                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <select 
                                    value={managerId}
                                    onChange={(e) => setManagerId(e.target.value)}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-blue-100 outline-none appearance-none transition-all font-bold text-sm"
                                >
                                    <option value="">No Manager (Root Node)</option>
                                    {managers.map(m => <option key={m.id} value={m.id}>{m.full_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold flex items-center gap-2">
                        <Zap className="w-4 h-4" /> {error}
                    </div>
                )}

                <div className="flex justify-end pt-4">
                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="px-12 py-5 bg-blue-600 text-white rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                        <span>Issue Stratum Key</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
