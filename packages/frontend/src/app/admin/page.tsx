'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../lib/api';
import { Shield, Building2, Landmark, Save, Search, Loader2, CheckCircle } from 'lucide-react';

interface Organization {
  id: string;
  name: string;
  bank_details?: string;
}

export default function AdminDashboard() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const api = useApi();

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const data = await api.get('/admin/organizations');
        setOrganizations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  const handleUpdateBankDetails = async (orgId: string, details: string) => {
    setSavingId(orgId);
    try {
      await api.put(`/admin/organizations/${orgId}/bank-details`, details);
      // Update local state
      setOrganizations(prev => prev.map(o => o.id === orgId ? { ...o, bank_details: details } : o));
    } catch (err) {
      alert('Failed to update bank details');
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-12 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-4 bg-gray-900 rounded-3xl text-white shadow-xl">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Admin Console</h1>
            <p className="text-gray-500 font-medium">Manage organization billing and manual bank details.</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search organizations..." 
            className="pl-12 pr-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all w-80 text-sm font-bold"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Organization</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Manual Bank Details</th>
              <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {organizations.map((org) => (
              <tr key={org.id} className="hover:bg-gray-50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <span className="font-black text-gray-900">{org.name}</span>
                  </div>
                </td>
                <td className="p-6">
                  <textarea 
                    defaultValue={org.bank_details || ''}
                    onBlur={(e) => handleUpdateBankDetails(org.id, e.target.value)}
                    placeholder="Enter wire instructions..."
                    className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl text-xs font-medium focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all min-h-[80px]"
                  />
                </td>
                <td className="p-6 text-right">
                  {savingId === org.id ? (
                    <Loader2 className="w-5 h-5 text-blue-600 animate-spin ml-auto" />
                  ) : (
                    <div className="text-emerald-500 flex items-center justify-end space-x-1 opacity-0 hover:opacity-100">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Auto-saved</span>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
