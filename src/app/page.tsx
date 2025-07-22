import React from 'react';
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Immediate redirect logic with minimal delay
    const redirectTimer = setTimeout(() => {
      // Check for existing session token quickly
      const hasToken = localStorage.getItem('sb-' + window.location.hostname.replace(/\./g, '-') + '-auth-token') || 
                       localStorage.getItem('supabase.auth.token');
      
      if (hasToken) {
        router.replace('/dashboard');
      } else {
        router.replace('/demo/concrete-job-dashboard');
      }
    }, 100); // Minimal delay for smooth UX

    // Show content briefly then redirect
    const contentTimer = setTimeout(() => {
      setShowContent(false);
    }, 1500);

    return () => {
      clearTimeout(redirectTimer);
      clearTimeout(contentTimer);
    };
  }, [router]);

  if (!showContent) return null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
      <div className="text-center max-w-4xl mx-auto px-4">
        {/* Pontifex Header */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-600 text-white p-8 rounded-xl mb-8">
          <h1 className="text-4xl font-bold mb-2">🏗️ Pontifex Industries</h1>
          <p className="text-xl">Construction Asset Management Platform</p>
          <p className="text-lg opacity-90">The Hilti ON!Track Killer</p>
        </div>

        {/* Quick Access Buttons - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <button
            onClick={() => router.push('/demo/concrete-job-dashboard')}
            className="bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🚧</div>
            <div className="font-semibold">Live Demo</div>
            <div className="text-sm">Try the platform</div>
          </button>
          
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-600 text-white hover:bg-blue-700 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🔐</div>
            <div className="font-semibold">Sign In</div>
            <div className="text-sm">Access your account</div>
          </button>
          
          <button
            onClick={() => router.push('/demo/scheduling-calendar')}
            className="bg-white border-2 border-purple-600 text-purple-600 hover:bg-purple-50 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🗓️</div>
            <div className="font-semibold">Smart Calendar</div>
            <div className="text-sm">DSM Killer scheduling</div>
          </button>
          
          <button
            onClick={() => router.push('/demo/work-type-selector')}
            className="bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold">Quick Start</div>
            <div className="text-sm">See work types</div>
          </button>
        </div>

        {/* Quick Access Buttons - Second Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => router.push('/demo/smart-job-form')}
            className="bg-white border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🎤</div>
            <div className="font-semibold">Smart Job Entry</div>
            <div className="text-sm">Voice + AI input</div>
          </button>
          
          <button
            onClick={() => router.push('/demo/reports-dashboard')}
            className="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-semibold">Analytics</div>
            <div className="text-sm">Real-time reports</div>
          </button>
          
          <button
            onClick={() => router.push('/demo/dsm-migration')}
            className="bg-white border-2 border-orange-600 text-orange-600 hover:bg-orange-50 p-4 rounded-lg transition-colors"
          >
            <div className="text-2xl mb-2">🚀</div>
            <div className="font-semibold">DSM Migration</div>
            <div className="text-sm">Switch in minutes</div>
          </button>
        </div>

        <p className="text-slate-600 text-sm">
          Loading your workspace...
        </p>
      </div>
    </main>
  );
}