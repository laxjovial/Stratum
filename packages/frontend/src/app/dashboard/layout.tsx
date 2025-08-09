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
  const { user, loading, logout } = useAuth(); // Destructure the logout function
  const router = useRouter();

  if (loading) {
    return (
        <div className="flex h-screen items-center justify-center">
            <p>Loading...</p>
        </div>
    );
  }

  // The AuthGuard component should handle this redirect, but we'll keep this check for redundancy.
  if (!user) {
    router.push('/login');
    return null; // Render nothing while redirecting
  }

  const handleLogout = async () => {
    try {
      // Call the logout function from the auth hook
      await logout();
      // Redirect to the login page after a successful logout
      router.push('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
      // You can add a more user-friendly error message here if needed
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <nav className="w-64 bg-gray-800 text-white p-5">
        <div className="mb-10">
            {/* Corrected Link usage */}
            <Link href="/dashboard" className="text-2xl font-bold">
                Stratum
            </Link>
        </div>
        <ul className="space-y-3">
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard" className="block p-2 rounded hover:bg-gray-700">
                Dashboard Home
            </Link>
          </li>
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard/hierarchy" className="block p-2 rounded hover:bg-gray-700">
                Organizational Hierarchy
            </Link>
          </li>
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard/documents" className="block p-2 rounded hover:bg-gray-700">
                Document Management
            </Link>
          </li>
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard/chat" className="block p-2 rounded hover:bg-gray-700">
                AI Assistant
            </Link>
          </li>
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard/content/builder" className="block p-2 rounded hover:bg-gray-700">
                Content Builder
            </Link>
          </li>
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard/analytics" className="block p-2 rounded hover:bg-gray-700">
                Analytics
            </Link>
          </li>
          <li>
            {/* Corrected Link usage */}
            <Link href="/dashboard/billing" className="block p-2 rounded hover:bg-gray-700">
                Billing
            </Link>
          </li>
          <li>
            {/* Added a placeholder Logout button, which you will need to implement */}
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
  );
}
