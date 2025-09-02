'use client';

import { useAuth } from '../../hooks/use-auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import AuthGuard from "../../components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call the logout function from the auth hook
      // Note: You will need to add a logout function to your use-auth.tsx
      // For example, signOut(auth) from Firebase
      // await logout();
      // Redirect to the login page after a successful logout
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-100">
        <nav className="w-64 bg-gray-800 text-white p-5">
          <div className="mb-10">
            <Link href="/dashboard" className="text-2xl font-bold">
              Stratum
            </Link>
          </div>
          <ul className="space-y-3">
            <li>
              <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-700">
                Dashboard Home
              </Link>
            </li>
            <li>
              <Link href="/dashboard/hierarchy" className="block p-2 rounded hover:bg-gray-700">
                Organizational Hierarchy
              </Link>
            </li>
            <li>
              <Link href="/dashboard/documents" className="block p-2 rounded hover:bg-gray-700">
                Document Management
              </Link>
            </li>
            <li>
              <Link href="/dashboard/chat" className="block p-2 rounded hover:bg-gray-700">
                AI Assistant
              </Link>
            </li>
            <li>
              <Link href="/dashboard/content/builder" className="block p-2 rounded hover:bg-gray-700">
                Content Builder
              </Link>
            </li>
            <li>
              <Link href="/dashboard/analytics" className="block p-2 rounded hover:bg-gray-700">
                Analytics
              </Link>
            </li>
            <li>
              <Link href="/dashboard/billing" className="block p-2 rounded hover:bg-gray-700">
                Billing
              </Link>
            </li>
            <li>
              <button onClick={handleLogout} className="block p-2 rounded hover:bg-gray-700 w-full text-left">
                Log Out
              </button>
            </li>
          </ul>
        </nav>
        <main className="flex-grow p-10 overflow-y-auto">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
