// src/app/admin/hardware-test/page.tsx - UI for the Hardware Test Suite
'use client';

import React, { useState } from 'react';
import { HardwareTestSuite, TestResult } from '@/lib/hardware-test';
import ProtectedRoute from '@/components/ProtectedRoute';
import { CheckCircle, XCircle, AlertTriangle, HelpCircle, Loader2, PlayCircle } from 'lucide-react';

const HardwareTestPage = () => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setResults([]);
    const testSuite = new HardwareTestSuite();
    const testResults = await testSuite.runAllTests();
    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'FAIL':
        return <XCircle className="w-6 h-6 text-red-500" />;
      case 'WARN':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'ERROR':
        return <AlertTriangle className="w-6 h-6 text-red-700" />;
      default:
        return <HelpCircle className="w-6 h-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'PASS':
        return 'border-green-500 bg-green-50';
      case 'FAIL':
        return 'border-red-500 bg-red-50';
      case 'WARN':
        return 'border-yellow-500 bg-yellow-50';
      case 'ERROR':
        return 'border-red-700 bg-red-100';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <ProtectedRoute requireAuth={true}>
      <main className="min-h-screen bg-slate-50 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border">
            <div className="border-b pb-6 mb-6">
              <h1 className="text-3xl font-bold text-slate-800">System & Hardware Test Suite</h1>
              <p className="text-slate-600 mt-2">
                This utility validates all critical system integrations. Run these tests to ensure the platform is ready for demonstration and deployment.
              </p>
            </div>

            <div className="text-center mb-8">
              <button
                onClick={runTests}
                disabled={testing}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:transform-none"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Running Tests...</span>
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-6 h-6" />
                    <span>Run All System Checks</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-4">
              {results.length > 0 ? (
                results.map((result, index) => (
                  <div key={index} className={`p-4 rounded-xl border-l-4 ${getStatusColor(result.status)}`}>
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getStatusIcon(result.status)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-slate-800">{result.test}</h3>
                          <span className="text-xs font-mono text-slate-500">{result.duration}ms</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{result.details}</p>
                        {result.error && (
                          <pre className="mt-2 p-2 bg-red-50 text-red-700 text-xs rounded-md overflow-x-auto">
                            <code>Error: {result.error}</code>
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-500 bg-slate-50 rounded-xl">
                  <p>Test results will appear here once the checks are run.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
};

export default HardwareTestPage;
