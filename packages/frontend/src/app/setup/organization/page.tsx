'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/use-auth';

import api from '../../../lib/api'; // Import the new API utility


export default function OrganizationSetupPage() {
  const { user, loading } = useAuth();
  const [orgName, setOrgName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // This is a placeholder for logic that would check if the user
  // is already part of an organization. In a real app, this might
  // be a flag on the user object from your backend or a separate API call.

  const needsSetup = true;


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && !needsSetup) {
      router.push('/dashboard');
    }
  }, [user, loading, needsSetup, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!user) {
      setError("Authentication error. Please try logging in again.");
      return;
    }

    try {

      // Use the new API utility. It handles the token automatically.
      await api.post('/setup/first-user', {
        organization_name: orgName,
        user_full_name: user.displayName || user.email
      });


      const token = await user.getIdToken();
      // NOTE: This assumes the Next.js app is configured to proxy requests
      // to the backend API to avoid CORS issues during development.
      const response = await fetch('/api/v1/setup/first-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ organization_name: orgName, user_full_name: user.displayName || user.email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create organization.');
      }


      // Successfully created, redirect to the main app dashboard
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-lg">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Stratum!</h1>
            <p className="mt-2 text-gray-600">Let's get your organization set up.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-gray-700">
              Organization Name
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              placeholder="e.g., Acme Corporation"
              className="w-full px-4 py-2 mt-1 text-lg border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full px-4 py-3 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            disabled={!orgName}
          >
            Create Organization & Continue
          </button>
        </form>
      </div>
    </div>
  );
}
