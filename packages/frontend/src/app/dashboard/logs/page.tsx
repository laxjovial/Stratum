'use client';

import React, { useState, useEffect } from 'react';
import { useApi } from '../../../lib/api';
import { History, User, Activity, Clock, Search, Filter, ArrowUpRight } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action: string;
  details: any;
  created_at: string;
  user?: {
    email: string;
    full_name?: string;
  };
}

export default function LogsPage() {
  const [logs, setLogs] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const api = useApi();

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const data = await api.get('/activity/logs');
        setLogs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
             <div className="p-3 bg-gray-900 rounded-2xl text-white shadow-xl">
               <History className="w-6 h-6" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Workspace Floors</h1>
          </div>
          <p className="text-gray-500 font-medium ml-1">Real-time audit log of organization activity and output.</p>
        </div>

        <div className="flex items-center space-x-2">
           <div className="relative">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input 
               type="text" 
               placeholder="Filter logs..." 
               className="pl-12 pr-6 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm outline-none focus:ring-4 focus:ring-blue-100 transition-all text-xs font-bold w-64"
             />
           </div>
           <button className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-blue-600 transition-colors">
             <Filter className="w-5 h-5" />
           </button>
        </div>
      </div>

    <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
             <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Auditing Floors...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-6 text-center">
             <div className="w-20 h-20 bg-gray-50 rounded-[32px] flex items-center justify-center text-gray-300">
                <History className="w-10 h-10" />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-black text-gray-900 uppercase tracking-tight">Quiet on the floor</h3>
                <p className="text-gray-400 font-medium max-w-xs mx-auto">No activity has been recorded yet. New actions will appear here in real-time.</p>
             </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">User / Actor</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Timestamp</th>
                  <th className="p-6 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-sm">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-gray-50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs uppercase shadow-sm">
                          {log.user?.full_name?.charAt(0) || log.user?.email.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 leading-tight">{log.user?.full_name || 'System Actor'}</p>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{log.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        log.action.includes('UPLOAD') ? 'bg-emerald-100 text-emerald-700' : 
                        log.action.includes('CREATE') ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-2 text-gray-600 font-medium italic">
                        <Activity className="w-3 h-3" />
                        <span>{log.details ? JSON.stringify(log.details) : 'No extra details'}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center space-x-2 text-gray-400 font-bold text-xs uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <button className="p-2 opacity-0 group-hover:opacity-100 bg-white border border-gray-100 rounded-xl shadow-sm hover:text-blue-600 transition-all">
                         <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: 'Floor Occupancy', value: '82%', desc: 'Productive hours', color: 'text-emerald-600' },
           { label: 'Activity Spike', value: '+14%', desc: 'vs last 24 hours', color: 'text-blue-600' },
           { label: 'Security Alerts', value: '0', desc: 'All systems clear', color: 'text-gray-400' },
         ].map((stat, i) => (
           <div key={i} className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm space-y-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
             <div className="flex items-baseline space-x-2">
               <span className={`text-4xl font-black tracking-tighter ${stat.color}`}>{stat.value}</span>
               <span className="text-xs text-gray-400 font-bold uppercase">{stat.desc}</span>
             </div>
           </div>
         ))}
      </div>
    </div>
  );
}
