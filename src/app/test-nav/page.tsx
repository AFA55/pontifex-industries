'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PageLink {
  name: string;
  path: string;
  description: string;
  loadTime?: number;
}

export default function TestNavigation() {
  const router = useRouter();
  const [loadTimes, setLoadTimes] = useState<Record<string, number>>({});

  const handlePageClick = (path: string) => {
    const startTime = Date.now();
    
    // Record click time for rough estimation
    setLoadTimes(prev => ({
      ...prev,
      [path]: Date.now() - startTime
    }));

    router.push(path);
  };

  const pageCategories = {
    main: [
      { name: 'Home', path: '/', description: 'Landing page with instant redirects' },
      { name: 'Login', path: '/login', description: 'Authentication page' },
      { name: 'Dashboard', path: '/dashboard', description: 'Main user dashboard' },
    ],
    demo: [
      { name: 'Concrete Job Dashboard', path: '/demo/concrete-job-dashboard', description: 'Demo dashboard for concrete jobs' },
      { name: 'Concrete Job Form', path: '/demo/concrete-job-form', description: 'Job creation form demo' },
      { name: 'Concrete Work Types', path: '/demo/concrete-work-types', description: 'Work types selector demo' },
      { name: 'Work Type Selector', path: '/demo/work-type-selector', description: 'Interactive work type picker' },
    ],
    management: [
      { name: 'Projects', path: '/projects', description: 'Project management interface' },
      { name: 'Contacts', path: '/contacts', description: 'Contact management' },
      { name: 'Surveys', path: '/surveys', description: 'Survey management' },
    ],
    admin: [
      { name: 'Admin Panel', path: '/admin', description: 'Administrative interface' },
      { name: 'Hardware Test', path: '/admin/hardware-test', description: 'BLE beacon testing suite' },
    ]
  };

  const PageCard = ({ page }: { page: PageLink }) => (
    <div 
      onClick={() => handlePageClick(page.path)}
      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all duration-200"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-blue-900">{page.name}</h3>
        {loadTimes[page.path] && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
            ~{loadTimes[page.path]}ms
          </span>
        )}
      </div>
      <p className="text-sm text-gray-600 mb-2">{page.description}</p>
      <div className="flex items-center justify-between">
        <code className="text-xs bg-gray-100 px-2 py-1 rounded">{page.path}</code>
        <span className="text-blue-600 text-sm">Click to test →</span>
      </div>
    </div>
  );

  const CategorySection = ({ title, pages }: { title: string; pages: PageLink[] }) => (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
        <span className="bg-blue-600 text-white px-3 py-1 rounded-md mr-3">
          {title.toUpperCase()}
        </span>
        <span className="text-sm text-gray-500 font-normal">
          {pages.length} page{pages.length !== 1 ? 's' : ''}
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((page) => (
          <PageCard key={page.path} page={page} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-teal-600 text-white p-6 rounded-xl mb-8">
          <h1 className="text-3xl font-bold mb-2">🧪 Test Navigation Center</h1>
          <p className="text-lg opacity-90">
            Click any page to test load time and functionality
          </p>
          <div className="mt-4 bg-white/10 rounded-lg p-4">
            <p className="text-sm">
              <strong>Performance Target:</strong> All pages should load under 500ms<br/>
              <strong>Instructions:</strong> Click any card to navigate and test that page
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg p-4 mb-6 border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {Object.values(pageCategories).flat().length}
              </div>
              <div className="text-sm text-gray-600">Total Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {pageCategories.demo.length}
              </div>
              <div className="text-sm text-gray-600">Demo Pages</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(loadTimes).length}
              </div>
              <div className="text-sm text-gray-600">Tested</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.values(loadTimes).filter(time => time < 500).length}
              </div>
              <div className="text-sm text-gray-600">Under 500ms</div>
            </div>
          </div>
        </div>

        {/* Page Categories */}
        <CategorySection title="Main Application" pages={pageCategories.main} />
        <CategorySection title="Demo Pages" pages={pageCategories.demo} />
        <CategorySection title="Management" pages={pageCategories.management} />
        <CategorySection title="Admin & Testing" pages={pageCategories.admin} />

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500">
          <p className="text-sm">
            🏗️ Pontifex Industries - Construction Asset Management Platform
          </p>
          <p className="text-xs mt-1">
            Test all pages for load time and functionality
          </p>
        </div>
      </div>
    </div>
  );
}