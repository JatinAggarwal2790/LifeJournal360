'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  signInWithGoogle: async () => {},
  signInAsGuest: async () => {},
  signOutUser: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const storedGuest = localStorage.getItem('lifejournal_guest_session');
      if (storedGuest) {
        try {
          const parsed = JSON.parse(storedGuest);
          if (parsed && parsed.uid) return parsed;
        } catch {
          // ignore parsing error
        }
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('lifejournal_guest_session');
          }
        } else {
          // Keep local guest user if present, otherwise set to null
          const storedGuest = typeof window !== 'undefined' ? localStorage.getItem('lifejournal_guest_session') : null;
          if (storedGuest) {
            try {
              setUser(JSON.parse(storedGuest));
            } catch {
              setUser(null);
            }
          } else {
            setUser(null);
          }
        }
        setLoading(false);
      },
      (err) => {
        console.error('Auth state change error:', err);
        setError(err.message || 'Authentication error');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setError(null);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Pop-up window was blocked by your browser. Please enable pop-ups or click "Explore in Guest Mode" below.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message || 'Sign in failed. Please try again or use Guest Mode.');
      }
    }
  };

  const signInAsGuest = async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        await signInAnonymously(auth);
      } catch (anonErr: any) {
        console.warn('Firebase anonymous auth restricted, initializing local guest vault:', anonErr?.message);
        const localGuest = {
          uid: 'guest-vault-' + Math.random().toString(36).substring(2, 9),
          displayName: 'Guest Explorer',
          email: 'guest@lifejournal360.local',
          photoURL: null,
          isAnonymous: true,
        } as any;
        setUser(localGuest);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lifejournal_guest_session', JSON.stringify(localGuest));
        }
      }
    } catch (err: any) {
      console.error('Guest sign-in failed:', err);
      setError('Unable to initialize guest session');
    } finally {
      setLoading(false);
    }
  };

  const signOutUser = async () => {
    try {
      setError(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('lifejournal_guest_session');
      }
      setUser(null);
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign-out failed:', err);
      setError(err.message || 'Sign out failed');
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInAsGuest,
        signOutUser,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
