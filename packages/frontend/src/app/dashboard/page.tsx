'use client';

import React from 'react';
import { useAuth } from '../../hooks/use-auth';

// This is the main content for the /dashboard route.
// It will be rendered inside the `DashboardLayout` component.
export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Welcome to Stratum, {user?.displayName || user?.email}!
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          This is your central hub. From here, you can navigate to all the core features of the platform.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card for Documents */}
          <div className="bg-blue-100 p-6 rounded-lg shadow-md transition-shadow hover:shadow-xl">
            <h2 className="text-xl font-semibold text-blue-800 mb-2">Document Management</h2>
            <p className="text-blue-600">
              Manage your documents, knowledge base, and collaborative files.
            </p>
          </div>

          {/* Card for AI Assistant */}
          <div className="bg-green-100 p-6 rounded-lg shadow-md transition-shadow hover:shadow-xl">
            <h2 className="text-xl font-semibold text-green-800 mb-2">AI Assistant</h2>
            <p className="text-green-600">
              Chat with our AI to get insights, summaries, and quick answers.
            </p>
          </div>

          {/* Card for Content Builder */}
          <div className="bg-purple-100 p-6 rounded-lg shadow-md transition-shadow hover:shadow-xl">
            <h2 className="text-xl font-semibold text-purple-800 mb-2">Content Builder</h2>
            <p className="text-purple-600">
              Create and manage content with our powerful tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
