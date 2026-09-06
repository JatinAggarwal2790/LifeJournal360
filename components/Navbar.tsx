'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { Sparkles, LogOut, ShieldCheck, History, Compass, PenTool, Lock } from 'lucide-react';

interface NavbarProps {
  currentView: 'choose' | 'active' | 'history';
  onViewChange: (view: 'choose' | 'active' | 'history') => void;
  entriesCount?: number;
}

export function Navbar({ currentView, onViewChange, entriesCount = 0 }: NavbarProps) {
  const { user, signOutUser } = useAuth();

  return (
    <header id="main-header" className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div
          onClick={() => onViewChange('choose')}
          className="flex items-center space-x-3 cursor-pointer select-none group"
        >
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-zinc-800 to-zinc-900 border border-zinc-700/60 text-white shadow-inner group-hover:border-lime-400/50 transition">
            <Sparkles className="h-4 w-4 text-lime-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-base font-bold tracking-tight text-zinc-100">
                Life Journal <span className="text-lime-400">360</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-zinc-800/90 border border-zinc-700/50 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
                <Lock className="h-2.5 w-2.5 text-lime-400" />
                Isolated Vault
              </span>
            </div>
          </div>
        </div>

        {/* Center Navigation if signed in */}
        {user && (
          <nav aria-label="Dashboard Tabs" className="flex items-center rounded-full border border-zinc-800 bg-zinc-900/90 p-1 shadow-inner backdrop-blur-md">
            <button
              id="tab-choose-journey"
              type="button"
              onClick={() => onViewChange('choose')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentView === 'choose'
                  ? 'bg-lime-400 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>Journeys</span>
            </button>
            <button
              id="tab-active-reflection"
              type="button"
              onClick={() => onViewChange('active')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentView === 'active'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Writing Desk</span>
            </button>
            <button
              id="tab-history-archive"
              type="button"
              onClick={() => onViewChange('history')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                currentView === 'history'
                  ? 'bg-zinc-100 text-zinc-950 shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="h-3.5 w-3.5" />
              <span>Archive</span>
              {entriesCount > 0 && (
                <span className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  currentView === 'history' ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-800 text-zinc-300'
                }`}>
                  {entriesCount}
                </span>
              )}
            </button>
          </nav>
        )}

        {/* User Info & Actions */}
        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden text-right md:block">
                <p className="text-xs font-semibold text-zinc-200">{user.displayName || 'Creator'}</p>
                <p className="text-[11px] text-zinc-400 truncate max-w-[130px]">{user.email}</p>
              </div>
              {user.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User Avatar'}
                  className="h-8 w-8 rounded-full border border-zinc-700 object-cover ring-1 ring-zinc-800"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-lime-400 to-emerald-500 text-xs font-bold text-zinc-950 shadow-sm">
                  {user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
              <button
                id="btn-signout"
                type="button"
                onClick={signOutUser}
                className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-red-400 transition"
                title="Sign out securely"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-zinc-400">
              <ShieldCheck className="h-4 w-4 text-lime-400" />
              <span>Isolated Workspace</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
