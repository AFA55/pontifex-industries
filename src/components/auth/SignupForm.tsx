import React from 'react';
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface SignupFormProps {
  onSuccess?: () => void;
}

export default function SignupForm({ onSuccess }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('operator');
  const { signUp, loading, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, fullName, role);
      // Call onSuccess callback if signup was successful and no error
      if (!error && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by the useAuth hook
      console.error('Signup error:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    clearError();
    switch (field) {
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'fullName':
        setFullName(value);
        break;
      case 'role':
        setRole(value);
        break;
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center text-pontifex-blue mb-6">
        Create Admin Account
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-pontifex-blue focus:border-pontifex-blue"
            placeholder="Enter full name"
            value={fullName}
            onChange={(e) => handleInputChange('fullName', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-pontifex-blue focus:border-pontifex-blue"
            placeholder="Enter email address"
            value={email}
            onChange={(e) => handleInputChange('email', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-pontifex-blue focus:border-pontifex-blue"
            placeholder="Enter password"
            value={password}
            onChange={(e) => handleInputChange('password', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            Role
          </label>
          <select
            id="role"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-pontifex-blue focus:border-pontifex-blue"
            value={role}
            onChange={(e) => handleInputChange('role', e.target.value)}
          >
            <option value="operator">Operator</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pontifex-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pontifex-blue disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="font-medium text-pontifex-blue hover:text-blue-500">
            Sign in here
          </a>
        </p>
      </div>
    </div>
  );
}