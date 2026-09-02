import React from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-zinc-800 text-lime-400 mb-4">
        <BookOpen className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-100">Page Not Found</h2>
      <p className="mt-2 text-sm text-zinc-400 max-w-sm">
        The journal page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-xl bg-lime-400 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-lime-300 transition"
      >
        Return to Journal
      </Link>
    </div>
  );
}
