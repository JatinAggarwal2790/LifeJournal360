'use client';

import React from 'react';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { LandingPage } from '@/components/LandingPage';
import { Dashboard } from '@/components/Dashboard';
import { Sparkles, Loader2 } from 'lucide-react';

function MainAppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 text-stone-700">
        <div className="flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-amber-500 animate-spin" />
          <span className="font-serif text-lg font-medium text-stone-900">
            Initializing ReflectAI Journal...
          </span>
        </div>
        <p className="mt-2 text-xs text-stone-500">Connecting to secure authentication service</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col">
        <Navbar currentView="active" onViewChange={() => {}} />
        <LandingPage />
      </div>
    );
  }

  return <Dashboard />;
}

export default function Page() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
