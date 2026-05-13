"use client";

import { useAuth } from "../hooks/use-auth";
import Link from "next/link";

/**
 * A client-side component to protect routes that require authentication.
 * Uses the global AuthProvider from use-auth.tsx.
 */
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700 animate-pulse">
          Loading...
        </div>
      </div>
    );
  }

  // If the user is not authenticated, display a message and a link.
  if (!user) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="text-xl font-semibold text-gray-700 text-center mb-4">
          You are not logged in.
        </div>
        <Link 
          href="/login" 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // If the user is authenticated, render the protected page content.
  return <>{children}</>;
};

export default AuthGuard;
