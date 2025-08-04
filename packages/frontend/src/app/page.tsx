'use client';

import { useAuth } from '../hooks/use-auth';
import Link from 'next/link';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold">Loading...</h1>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to Stratum</h1>
        {user ? (
          <div>
            <p className="mb-4">You are logged in as {user.email}.</p>
            {/* In a real app, this would link to a protected dashboard page */}
            <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div>
            <p className="mb-4">You are not logged in. Please log in or sign up to continue.</p>
            <div className="space-x-4">
              <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                Login
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
