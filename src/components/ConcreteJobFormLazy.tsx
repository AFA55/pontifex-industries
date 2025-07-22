import React from 'react';
'use client';

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import the ConcreteJobForm with a loading state
export const ConcreteJobFormLazy = dynamic(
  () => import('./ConcreteJobForm').then(mod => ({ default: mod.ConcreteJobForm })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-pontifex-blue" />
        <span className="ml-2">Loading form...</span>
      </div>
    ),
    ssr: false // Disable SSR for this component since it uses browser APIs
  }
);