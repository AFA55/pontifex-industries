'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import SignupForm from '@/components/auth/SignupForm'
import { supabase } from '@/lib/supabase'

interface DemoAccount {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
}

export default function AdminPage() {
  const { user, profile, loading, signOut } = useAuth() // ✅ Fixed: Call useAuth at top level
  const [accounts, setAccounts] = useState<DemoAccount[]>([])
  const [loadingAccounts, setLoadingAccounts] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchAccounts()
    }
  }, [user])

  const fetchAccounts = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, role, created_at')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAccounts(data || [])
    } catch (error) {
      console.error('Error fetching accounts:', error)
    } finally {
      setLoadingAccounts(false)
    }
  }

  const handleAccountCreated = () => {
    fetchAccounts() // Refresh the list
  }

  const handleSignOut = async () => {
    // ✅ Fixed: Use signOut from useAuth hook called at top level
    await signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-construction">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-pontifex-blue-900 to-teal-600 text-white p-6 rounded-xl mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">👑 Admin Portal</h1>
              <p className="text-lg">Pontifex Industries Demo Management</p>
              <p className="opacity-90">Welcome, {profile?.full_name}</p>
            </div>
            <div className="space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-white text-pontifex-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                View Dashboard
              </button>
              <button
                onClick={handleSignOut}
                className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Create Account Form */}
          <div>
            <SignupForm onSuccess={handleAccountCreated} />
          </div>

          {/* Existing Accounts */}
          <div className="card-pontifex">
            <h2 className="text-2xl font-bold text-pontifex-blue-900 mb-4">
              Demo Accounts ({accounts.length})
            </h2>
            
            {loadingAccounts ? (
              <p>Loading accounts...</p>
            ) : (
              <div className="space-y-3">
                {accounts.map((account) => (
                  <div key={account.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{account.full_name}</h3>
                        <p className="text-gray-600 text-sm">{account.email}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          account.role === 'admin' ? 'bg-red-100 text-red-800' :
                          account.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {account.role}
                        </span>
                        <p className="text-gray-500 text-xs mt-1">
                          {new Date(account.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demo Instructions */}
        <div className="card-pontifex mt-8">
          <h2 className="text-2xl font-bold text-pontifex-blue-900 mb-4">
            🎯 Thursday Demo Instructions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Create Accounts</h3>
              <p className="text-gray-600">Use the form to create demo accounts for each attendee. Different roles show different features.</p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">2. Share Login URL</h3>
              <p className="text-gray-600">Give attendees: <code className="bg-gray-100 px-2 py-1 rounded">/login</code></p>
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">3. Demo Features</h3>
              <p className="text-gray-600">Show asset management, QR scanning, and real-time updates across multiple users.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}