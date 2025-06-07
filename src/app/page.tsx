'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          {/* Pontifex Header */}
          <div className="bg-gradient-to-r from-blue-900 to-teal-600 text-white p-8 rounded-xl mb-8 max-w-2xl">
            <h1 className="text-4xl font-bold mb-2">🏗️ Pontifex Industries</h1>
            <p className="text-xl">Construction Asset Management Platform</p>
            <p className="text-lg opacity-90">The Hilti ON!Track Killer</p>
          </div>

          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Initializing your workspace...</p>
          </div>
        </div>
      </main>
    );
  }

  return null;
}