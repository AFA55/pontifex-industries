'use client'

import React from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <p className="text-gray-600">Projects feature coming soon...</p>
      </div>
    </ProtectedRoute>
  )
}