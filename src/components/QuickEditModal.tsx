'use client'

import React, { useState, useEffect } from 'react'
import { X, Save, CheckCircle, Circle, AlertTriangle, MapPin, User, MessageSquare, Zap, Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface QuickEditModalProps {
  isOpen: boolean
  onClose: () => void
  asset: {
    id: string
    asset_id?: string
    name?: string
    status: 'available' | 'in_use' | 'maintenance' | 'offline'
    location?: string
    current_location_id?: string
    assigned_to?: string
    category?: string
    serial_number?: string
  }
  onAssetUpdated: () => void
}

export default function QuickEditModal({ isOpen, onClose, asset, onAssetUpdated }: QuickEditModalProps) {
  const [formData, setFormData] = useState({
    status: asset.status,
    current_location_id: asset.current_location_id || '',
    assigned_to: asset.assigned_to || '',
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Array<{id: string, name: string}>>([])
  const [users, setUsers] = useState<Array<{id: string, name: string, email: string}>>([])
  
  const { toast } = useToast()

  // Status configuration with enhanced visual design
  const statusOptions = [
    {
      value: 'available',
      label: 'Available',
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-500/10',
      border: 'border-green-500/30',
      hoverBg: 'hover:bg-green-500/20',
      activeBg: 'bg-green-500/30 border-green-500'
    },
    {
      value: 'in_use',
      label: 'In Use',
      icon: Circle,
      color: 'text-orange-600',
      bg: 'bg-orange-500/10',
      border: 'border-orange-500/30',
      hoverBg: 'hover:bg-orange-500/20',
      activeBg: 'bg-orange-500/30 border-orange-500'
    },
    {
      value: 'maintenance',
      label: 'Maintenance',
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-500/10',
      border: 'border-red-500/30',
      hoverBg: 'hover:bg-red-500/20',
      activeBg: 'bg-red-500/30 border-red-500'
    },
    {
      value: 'offline',
      label: 'Offline',
      icon: Circle,
      color: 'text-gray-600',
      bg: 'bg-gray-500/10',
      border: 'border-gray-500/30',
      hoverBg: 'hover:bg-gray-500/20',
      activeBg: 'bg-gray-500/30 border-gray-500'
    }
  ]

  // Load data on component mount
  useEffect(() => {
    if (isOpen) {
      loadLocations()
      loadUsers()
      // Reset form data when asset changes
      setFormData({
        status: asset.status,
        current_location_id: asset.current_location_id || '',
        assigned_to: asset.assigned_to || '',
        notes: ''
      })
    }
  }, [isOpen, asset])

  const loadLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name')
        .order('name')
      
      if (error) throw error
      setLocations(data || [])
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const loadUsers = async () => {
    try {
      // In real app, would load from users/profiles table
      // For demo, using sample users
      setUsers([
        { id: 'user1', name: 'John Smith', email: 'john@pontifex.com' },
        { id: 'user2', name: 'Maria Garcia', email: 'maria@pontifex.com' },
        { id: 'user3', name: 'Mike Johnson', email: 'mike@pontifex.com' },
        { id: 'user4', name: 'Sarah Chen', email: 'sarah@pontifex.com' },
        { id: 'unassigned', name: 'Unassigned', email: '' }
      ])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Update asset in database
      const updateData = {
        status: formData.status,
        current_location_id: formData.current_location_id || null,
        assigned_to: formData.assigned_to === 'unassigned' ? null : formData.assigned_to,
        last_updated: new Date().toISOString()
      }

      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', asset.id)

      if (error) throw error

      // Add activity log entry if notes provided
      if (formData.notes.trim()) {
        await supabase
          .from('asset_activities')
          .insert([{
            asset_id: asset.id,
            activity_type: 'status_change',
            description: `Status changed to ${formData.status}. Notes: ${formData.notes}`,
            created_at: new Date().toISOString()
          }])
      }

      // Success!
      toast({
        title: "Asset Updated",
        description: `${asset.name || 'Asset'} has been updated successfully`,
        variant: "default"
      })

      onAssetUpdated()
      onClose()
      
    } catch (error) {
      console.error('Error updating asset:', error)
      toast({
        title: "Update Failed",
        description: "Failed to update asset. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = (status: 'available' | 'in_use' | 'maintenance' | 'offline') => {
    setFormData(prev => ({ ...prev, status }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Zap className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Quick Edit</h2>
              <p className="text-green-100 text-sm">Lightning-fast updates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Asset Info Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {asset.name || 'Asset'}
                </h3>
                <p className="text-sm text-gray-600">
                  #{asset.serial_number || asset.asset_id || asset.id.slice(0, 8)}
                </p>
              </div>
            </div>
          </div>

          {/* Status Selection - Primary Focus */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Status Update <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((option) => {
                const Icon = option.icon
                const isSelected = formData.status === option.value
                
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleStatusChange(option.value as 'available' | 'in_use' | 'maintenance' | 'offline')}
                    className={`
                      flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 min-h-[60px]
                      ${isSelected 
                        ? `${option.activeBg} shadow-lg scale-105` 
                        : `${option.bg} ${option.border} ${option.hoverBg} hover:scale-102`
                      }
                    `}
                  >
                    <Icon className={`w-6 h-6 ${option.color}`} />
                    <div className="text-left">
                      <p className={`font-semibold ${option.color}`}>
                        {option.label}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Location Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline mr-1" />
              Location
            </label>
            <select
              value={formData.current_location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, current_location_id: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 min-h-[56px]"
            >
              <option value="">Select Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          {/* User Assignment */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assigned To
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 min-h-[56px]"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.email && `(${user.email})`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Quick Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Brief update notes (e.g., 'Motor sounds rough', 'Moved to Site B')"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 resize-none"
            />
          </div>

          {/* Action Buttons - Construction-Worker Optimized */}
          <div className="grid grid-cols-1 gap-3">
            {/* Save Button - Primary Action */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white rounded-xl py-4 px-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 min-h-[56px] disabled:opacity-50 disabled:transform-none"
            >
              <Save className="w-6 h-6" />
              <span className="font-semibold text-lg">
                {loading ? 'Updating...' : 'Save Changes'}
              </span>
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium min-h-[48px]"
            >
              Cancel
            </button>
          </div>

          {/* Speed Comparison */}
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-semibold text-green-800 mb-2 flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Speed Advantage</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Hilti ON!Track:</p>
                <p className="font-semibold text-red-600">~45 seconds</p>
                <p className="text-xs text-gray-500">Navigate, load, scroll, update</p>
              </div>
              <div>
                <p className="text-gray-600">Pontifex Quick Edit:</p>
                <p className="font-semibold text-green-600">~10 seconds</p>
                <p className="text-xs text-gray-500">Tap, select, save - done!</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}