'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode, useCallback } from 'react';
import { isConfigured as isFirebaseConfigured } from '../lib/firebase';
import { isSupabaseConfigured } from '../lib/supabase';
import { 
  AuthUser, 
  AuthProviderType, 
  AuthError, 
  IAuthService, 
  FirebaseAuthProvider, 
  SupabaseAuthProvider, 
  mapError 
} from '../lib/auth-providers';

// --- Context ---

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  provider: AuthProviderType;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Robust provider detection
  const providerType: AuthProviderType = (() => {
    if (isFirebaseConfigured) return 'firebase';
    if (isSupabaseConfigured) return 'supabase';
    return 'none';
  })();

  // Instantiate the service based on provider
  const authService = React.useMemo(() => {
    if (providerType === 'firebase') return new FirebaseAuthProvider();
    if (providerType === 'supabase') return new SupabaseAuthProvider();
    return null;
  }, [providerType]);

  // Startup Safety Check & Environment Validation
  useEffect(() => {
    if (providerType === 'none') {
      console.error('CRITICAL: No authentication provider (Firebase or Supabase) is configured. Check your .env files.');
    } else {
      console.log(`Auth initialized with ${providerType} provider.`);
    }
  }, [providerType]);

  const refreshUser = useCallback(async () => {
    if (authService) {
      try {
        const updatedUser = await authService.refreshUser();
        setUser(updatedUser);
      } catch (err) {
        console.error('Failed to refresh user:', err);
      }
    }
  }, [authService]);

  // Auth State Listener
  useEffect(() => {
    if (!authService) {
      setLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [authService]);

  // Auto-login polling for verification
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (user && !user.emailVerified) {
      interval = setInterval(() => {
        refreshUser();
      }, 3000); 
    }
    return () => clearInterval(interval);
  }, [user, refreshUser]);

  const login = async (email: string, password: string, rememberMe = true) => {
    if (!authService) throw new Error('No auth provider configured');
    try {
      await authService.login(email, password, rememberMe);
    } catch (err) {
      throw mapError(err, providerType);
    }
  };

  const signup = async (email: string, password: string) => {
    if (!authService) throw new Error('No auth provider configured');
    try {
      await authService.signup(email, password);
    } catch (err) {
      throw mapError(err, providerType);
    }
  };

  const logout = async () => {
    if (authService) await authService.logout();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!authService) throw new Error('No auth provider configured');
    try {
      await authService.resetPassword(email);
    } catch (err) {
      throw mapError(err, providerType);
    }
  };

  const getToken = async () => {
    if (!authService) return null;
    return await authService.getToken();
  };

  const value = { user, loading, provider: providerType, login, signup, logout, resetPassword, refreshUser, getToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { AuthUser, AuthError };
