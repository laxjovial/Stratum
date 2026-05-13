import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  User as FirebaseUser
} from 'firebase/auth';
import { auth as firebaseAuth } from './firebase';
import { supabase } from './supabase';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';

// --- Types & Interfaces ---

export interface AuthUser {
  uid: string;
  email: string | null;
  provider: 'firebase' | 'supabase';
  emailVerified: boolean;
}

export type AuthProviderType = 'firebase' | 'supabase' | 'none';

export interface AuthError {
  code: string;
  message: string;
  type: 'invalid-input' | 'user-exists' | 'not-verified' | 'wrong-credentials' | 'too-many-requests' | 'unknown';
}

/**
 * Standard interface for Auth Services
 */
export interface IAuthService {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  transformUser: (rawUser: any) => AuthUser | null;
  onAuthStateChanged: (callback: (user: AuthUser | null) => void) => () => void;
  getToken: () => Promise<string | null>;
}

// --- Provider Implementations ---

export class FirebaseAuthProvider implements IAuthService {
  async login(email: string, password: string, rememberMe = true) {
    if (!firebaseAuth) throw new Error('Firebase Auth not initialized');
    await setPersistence(firebaseAuth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    await signInWithEmailAndPassword(firebaseAuth, email.trim(), password);
  }

  async signup(email: string, password: string) {
    if (!firebaseAuth) throw new Error('Firebase Auth not initialized');
    await createUserWithEmailAndPassword(firebaseAuth, email.trim(), password);
  }

  async logout() {
    if (firebaseAuth) await firebaseSignOut(firebaseAuth);
  }

  async resetPassword(email: string) {
    if (!firebaseAuth) throw new Error('Firebase Auth not initialized');
    await sendPasswordResetEmail(firebaseAuth, email.trim());
  }

  async refreshUser(): Promise<AuthUser | null> {
    if (firebaseAuth?.currentUser) {
      await firebaseAuth.currentUser.reload();
      return this.transformUser(firebaseAuth.currentUser);
    }
    return null;
  }

  transformUser(u: FirebaseUser | null): AuthUser | null {
    if (!u) return null;
    return { uid: u.uid, email: u.email, provider: 'firebase', emailVerified: u.emailVerified };
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    if (!firebaseAuth) return () => {};
    return onAuthStateChanged(firebaseAuth, (u) => callback(this.transformUser(u)));
  }

  async getToken(): Promise<string | null> {
    if (!firebaseAuth?.currentUser) return null;
    return await firebaseAuth.currentUser.getIdToken();
  }
}

export class SupabaseAuthProvider implements IAuthService {
  async login(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
  }

  async signup(email: string, password: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { data, error } = await supabase.auth.signUp({ 
      email: email.trim(), 
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });
    if (error) throw error;
    
    // Check if the user already exists (Supabase enumeration protection pattern)
    // If user is returned but has no identities, it means they are already registered
    if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
      throw { message: 'User already registered', code: 'user-exists' };
    }
  }

  async logout() {
    if (supabase) await supabase.auth.signOut();
  }

  async resetPassword(email: string) {
    if (!supabase) throw new Error('Supabase client not initialized');
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    if (error) throw error;
  }

  async refreshUser(): Promise<AuthUser | null> {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    return this.transformUser(user);
  }

  transformUser(u: any): AuthUser | null {
    if (!u) return null;
    return { uid: u.id, email: u.email, provider: 'supabase', emailVerified: !!u.email_confirmed_at };
  }

  onAuthStateChanged(callback: (user: AuthUser | null) => void) {
    if (!supabase) return () => {};
    
    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      callback(this.transformUser(session?.user));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      callback(this.transformUser(session?.user));
    });

    return () => subscription.unsubscribe();
  }

  async getToken(): Promise<string | null> {
    if (!supabase) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }
}

// --- Error Mapping ---

export const mapError = (error: any, provider: AuthProviderType): AuthError => {
  const msg = error.message || '';
  const code = error.code || error.status?.toString() || 'unknown';

  if (provider === 'firebase') {
    if (code === 'auth/invalid-email' || code === 'auth/invalid-credential') return { code, type: 'invalid-input', message: 'The email address is invalid.' };
    if (code === 'auth/email-already-in-use') return { code, type: 'user-exists', message: 'An account with this email already exists. Did you mean to log in?' };
    if (code === 'auth/user-not-found' || code === 'auth/wrong-password') return { code, type: 'wrong-credentials', message: 'Invalid email or password.' };
    if (code === 'auth/too-many-requests') return { code, type: 'too-many-requests', message: 'Too many failed attempts. Please try again in 30s.' };
    if (code === 'auth/network-request-failed') return { code, type: 'unknown', message: 'Network error. Please check your internet connection.' };
    if (code === 'auth/user-disabled') return { code, type: 'unknown', message: 'This account has been disabled. Please contact support.' };
  }

  if (provider === 'supabase') {
    if (msg.includes('Email not confirmed')) return { code, type: 'not-verified', message: "You've already signed up but haven't verified your email yet." };
    if (msg.includes('User already registered')) return { code, type: 'user-exists', message: 'An account with this email already exists. Did you mean to log in?' };
    if (msg.includes('Invalid login credentials')) return { code, type: 'wrong-credentials', message: 'Invalid email or password.' };
    if (code === '429') return { code, type: 'too-many-requests', message: 'Too many requests. Please slow down.' };
  }

  return { code, type: 'unknown', message: msg || 'An unexpected error occurred. Please try again.' };
};
