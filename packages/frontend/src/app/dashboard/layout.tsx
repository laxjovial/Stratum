'use client';
import { useAuth } from '../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  if (!user) {
    router.push('/login');
    return null; // Render nothing while redirecting
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-gray-800 text-white p-5">
        <div className="mb-10">
            <Link href="/dashboard">
                <span className="text-2xl font-bold">Stratum</span>
            </Link>
        </div>
        <ul className="space-y-3">
          <li>
            <Link href="/dashboard">
                <span className="block p-2 rounded hover:bg-gray-700">Dashboard Home</span>
            </Link>
          </li>
          <li>
            <Link href="/dashboard/hierarchy">
                <span className="block p-2 rounded hover:bg-gray-700">Org Hierarchy</span>
            </Link>
          </li>
          {/* Other links will go here */}
        </ul>
      </nav>
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
