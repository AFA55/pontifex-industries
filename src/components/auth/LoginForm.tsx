import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const [email, setEmail] = useState('demo@pontifex.com');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, loading, error, clearError, user } = useAuth();
  const router = useRouter();

  console.log('🔍 LoginForm render - user:', user, 'loading:', loading, 'error:', error);

  // Clear error when component mounts
  useEffect(() => {
    console.log('🔍 LoginForm mounted');
    clearError();
  }, [clearError]);

  // Redirect if already logged in
  useEffect(() => {
    console.log('🔍 User state changed:', user);
    if (user) {
      console.log('✅ User logged in, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🔍 Form submit triggered');
    e.preventDefault();
    console.log('🔍 preventDefault called');
    
    clearError();
    console.log('🔍 About to call signIn with:', email, password);
    
    try {
      await signIn(email, password);
      console.log('✅ signIn call completed');
    } catch (err) {
      console.error('❌ signIn error:', err);
    }
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
    console.log('🔍 Input changed:', field, value);
    clearError();
    if (field === 'email') {
      setEmail(value);
    } else {
      setPassword(value);
    }
  };

  const handleButtonClick = () => {
    console.log('🔍 Sign In button clicked directly');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-xl bg-blue-600">
            <span className="text-white font-bold text-xl">🏗️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Pontifex Industries
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Asset Management Login
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <button
                type="button"
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={clearError}
              >
                <span className="text-red-700 hover:text-red-900">&times;</span>
              </button>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  className="appearance-none relative block w-full px-3 py-2 pr-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.465 8.465m1.413 1.413L8.465 11.29m1.413-1.413l2.122 2.122m0 0l2.122 2.122M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              onClick={handleButtonClick}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>

          <div className="text-center">
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm text-gray-600 font-medium">Demo Account (Pre-filled):</p>
              <p className="text-sm text-gray-800">demo@pontifex.com / demo123</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Need an account?{' '}
              <a href="/admin" className="font-medium text-blue-600 hover:text-blue-500">
                Create Admin Account
              </a>
            </p>
          </div>
        </form>

        {/* Debug Info */}
        <div className="mt-4 p-3 bg-yellow-50 rounded text-xs">
          <strong>Debug Info:</strong><br/>
          User: {user ? '✅ Logged in' : '❌ Not logged in'}<br/>
          Loading: {loading ? '✅ Yes' : '❌ No'}<br/>
          Error: {error || 'None'}
        </div>
      </div>
    </div>
  );
}