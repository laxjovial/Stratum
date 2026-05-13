'use client';

import MemberNetwork from '../../../components/MemberNetwork';

export default function HierarchyPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 px-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Organizational Web</h1>
          <p className="text-gray-500 font-medium italic">Visualize your network of connections and manage hierarchical reporting lines.</p>
        </div>
      </div>
      
      <div className="min-h-screen">
        <MemberNetwork />
      </div>
    </div>
  );
}
