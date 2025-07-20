'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from "@/hooks/useAuth";

// Pages that don't need heavy auth checks
const LIGHTWEIGHT_PAGES = [
  '/',
  '/demo',
  '/demo/concrete-job-dashboard',
  '/demo/concrete-job-form',
  '/demo/concrete-work-types',
  '/demo/work-type-selector',
];

export function ConditionalAuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // For home page and demo pages, provide minimal auth context
  if (LIGHTWEIGHT_PAGES.includes(pathname) || pathname.startsWith('/demo/')) {
    return <>{children}</>;
  }
  
  // For all other pages, provide full auth context
  return <AuthProvider>{children}</AuthProvider>;
}