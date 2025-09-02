"use client";

import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';
// Assuming 'app' from '../lib/firebase' is available and correctly initialized.
import { app } from '../lib/firebase'; 

// This internal context and hook are created to make this component self-contained,
// resolving the `Module not found` error for `useAuth`.
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// The AuthProvider component is now a private, internal part of this file.
// In your `layout.tsx`, you will now only need to wrap the children with AuthGuard.
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const authInstance = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authInstance]);

  const value = { user, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};


/**
 * A client-side component to protect routes that require authentication.
 * This version wraps the application with its own AuthProvider to avoid
 * import issues and handles redirection without the `useRouter` hook.
 */
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <AuthContentRenderer>{children}</AuthContentRenderer>
    </AuthProvider>
  );
};

const AuthContentRenderer = ({ children }: { children: React.ReactNode }) => {
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
        <a 
          href="/login" 
          className="px-6 py-2 bg-blue-500 text-white rounded-lg shadow-md hover:bg-blue-600 transition-colors"
        >
          Go to Login
        </a>
      </div>
    );
  }

  // If the user is authenticated, render the protected page content.
  return <>{children}</>;
};

export default AuthGuard;
