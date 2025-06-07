'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  company_id: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role?: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('🔍 AuthProvider render - user:', user?.email, 'loading:', loading);

  useEffect(() => {
    const getSession = async () => {
      try {
        console.log('🔍 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔍 Initial session result:', { session: session?.user?.email, error });
        
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      } catch (error) {
        console.error('❌ Error getting session:', error);
        setError('Failed to get session');
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 Auth state change:', event, session?.user?.email);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      console.log('🔍 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('❌ Profile fetch error:', error);
        return;
      }
      
      console.log('✅ Profile fetched:', data?.email);
      setProfile(data);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔍 signIn function called with:', email);
    setError(null);
    setLoading(true);
    
    try {
      console.log('🔍 About to call supabase.auth.signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log('🔍 Supabase signInWithPassword response:', { user: data?.user?.email, error });

      if (error) {
        console.log('❌ Authentication error:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Authentication successful!');
        // The onAuthStateChange will handle setting the user
      }
    } catch (error) {
      console.log('❌ Unexpected error in signIn:', error);
      setError('An unexpected error occurred');
    } finally {
      console.log('🔍 Setting loading to false');
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string, role: string = 'operator') => {
    console.log('🔍 signUp function called with:', email, fullName, role);
    setError(null);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.log('❌ Signup error:', error.message);
        setError(error.message);
        return;
      }

      console.log('✅ User created:', data?.user?.email);

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            full_name: fullName,
            role,
            company_id: null,
          });

        if (profileError) {
          console.error('❌ Error creating profile:', profileError);
          setError('Account created but failed to create profile');
        } else {
          console.log('✅ Profile created successfully');
        }
      }
    } catch (error) {
      console.log('❌ Unexpected error in signUp:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🔍 signOut function called');
    setError(null);
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.log('❌ Sign out error:', error.message);
        setError(error.message);
      } else {
        console.log('✅ Successfully signed out');
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.log('❌ Unexpected error in signOut:', error);
      setError('Failed to sign out');
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
  };

  return React.createElement(
    AuthContext.Provider,
    { value },
    children
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};