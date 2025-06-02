'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, ArrowUpDown, MapPin, User, MessageSquare, Truck, Clock, Building, Wrench } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface QuickMoveModalProps {
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

interface Location {
  id: string
  name: string
  address?: string
  type?: string
}

interface User {
  id: string
  name: string
  email: string
  role?: string
}

export default function QuickMoveModal({ isOpen, onClose, asset, onAssetUpdated }: QuickMoveModalProps) {
  const [formData, setFormData] = useState({
    new_location_id: '',
    assigned_to: asset?.assigned_to || '',
    transfer_reason: '',
    transfer_date: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Location[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [recentLocations, setRecentLocations] = useState<Location[]>([])
  
  const { toast } = useToast()

  // Common transfer reasons for construction sites
  const transferReasons = [
    'Project Completion',
    'Site Transfer',
    'Maintenance Required',
    'Equipment Request',
    'Load Balancing',
    'Emergency Deployment',
    'Return to Warehouse',
    'Other'
  ]

  const loadLocations = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, address, type')
        .order('name')
      
      if (error) throw error
      setLocations(data || [])
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }, [])

  const loadUsers = useCallback(async () => {
    try {
      // In real app, would load from users/profiles table
      // For demo, using sample users with construction roles
      setUsers([
        { id: 'user1', name: 'John Smith', email: 'john@pontifex.com', role: 'Site Manager' },
        { id: 'user2', name: 'Maria Garcia', email: 'maria@pontifex.com', role: 'Equipment Operator' },
        { id: 'user3', name: 'Mike Johnson', email: 'mike@pontifex.com', role: 'Project Foreman' },
        { id: 'user4', name: 'Sarah Chen', email: 'sarah@pontifex.com', role: 'Safety Supervisor' },
        { id: 'user5', name: 'David Wilson', email: 'david@pontifex.com', role: 'Site Supervisor' },
        { id: 'unassigned', name: 'Unassigned', email: '', role: 'Pool Equipment' }
      ])
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }, [])

  const loadRecentLocations = useCallback(async () => {
    try {
      // In real app, would load from recent transfers or frequently used locations
      // For demo, showing sample recent locations
      const recent = locations.slice(0, 4)
      setRecentLocations(recent)
    } catch (error) {
      console.error('Error loading recent locations:', error)
    }
  }, [locations])

  // Load data on component mount
  useEffect(() => {
    if (isOpen && asset) {
      loadLocations()
      loadUsers()
      // Reset form data when asset changes
      setFormData({
        new_location_id: '',
        assigned_to: asset.assigned_to || '',
        transfer_reason: '',
        transfer_date: new Date().toISOString().split('T')[0],
        notes: ''
      })
    }
  }, [isOpen, asset, loadLocations, loadUsers])

  // Load recent locations when main locations change
  useEffect(() => {
    if (locations.length > 0) {
      loadRecentLocations()
    }
  }, [locations, loadRecentLocations])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.new_location_id) {
      toast({
        title: "Location Required",
        description: "Please select a destination location",
        variant: "destructive"
      })
      return
    }

    setLoading(true)

    try {
      // Update asset location and assignment
      const updateData = {
        current_location_id: formData.new_location_id,
        assigned_to: formData.assigned_to === 'unassigned' ? null : formData.assigned_to,
        last_updated: new Date().toISOString()
      }

      const { error: updateError } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', asset?.id)

      if (updateError) throw updateError

      // Create transfer record for audit trail (optional - only if table exists)
      try {
        const transferData = {
          asset_id: asset?.id,
          from_location_id: asset?.current_location_id,
          to_location_id: formData.new_location_id,
          assigned_to: formData.assigned_to === 'unassigned' ? null : formData.assigned_to,
          transfer_reason: formData.transfer_reason,
          transfer_date: formData.transfer_date,
          notes: formData.notes,
          created_at: new Date().toISOString()
        }

        await supabase
          .from('asset_transfers')
          .insert([transferData])
      } catch (transferError) {
        console.log('Transfer logging failed (table may not exist):', transferError)
      }

      // Add activity log entry (optional - only if table exists)
      try {
        const newLocationName = locations.find(loc => loc.id === formData.new_location_id)?.name || 'Unknown'
        const oldLocationName = asset?.location || 'Unknown'
        
        await supabase
          .from('asset_activities')
          .insert([{
            asset_id: asset?.id,
            activity_type: 'transfer',
            description: `Moved from ${oldLocationName} to ${newLocationName}. Reason: ${formData.transfer_reason}`,
            created_at: new Date().toISOString()
          }])
      } catch (activityError) {
        console.log('Activity logging failed (table may not exist):', activityError)
      }

      // Success!
      const newLocationName = locations.find(loc => loc.id === formData.new_location_id)?.name || 'Unknown'
      toast({
        title: "Transfer Complete",
        description: `${asset?.name || 'Asset'} successfully moved to ${newLocationName}`,
        variant: "default"
      })

      onAssetUpdated()
      onClose()
      
    } catch (error) {
      console.error('Error transferring asset:', error)
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer asset. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getLocationIcon = (type?: string) => {
    switch (type) {
      case 'warehouse':
        return Building
      case 'site':
        return MapPin
      case 'office':
        return Building
      default:
        return MapPin
    }
  }

  if (!isOpen || !asset) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">Quick Move</h2>
              <p className="text-orange-100 text-sm">Instant asset transfer</p>
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
          <div className="mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {asset?.name || 'Asset'}
                </h3>
                <p className="text-sm text-gray-600">
                  #{asset?.serial_number || asset?.asset_id || asset?.id?.slice(0, 8) || 'Unknown'}
                </p>
              </div>
            </div>

            {/* Current Location */}
            <div className="flex items-center space-x-2 text-sm bg-white/60 rounded-lg p-3">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Current Location:</span>
              <span className="font-semibold text-gray-900">
                {asset?.location || 'Unknown Location'}
              </span>
            </div>
          </div>

          {/* Destination Location - Primary Focus */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <ArrowUpDown className="w-4 h-4 inline mr-1" />
              Move To Location <span className="text-red-500">*</span>
            </label>
            
            {/* Quick Location Buttons */}
            {recentLocations.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Recent Locations:</p>
                <div className="grid grid-cols-2 gap-2">
                  {recentLocations.map((location) => {
                    const LocationIcon = getLocationIcon(location.type)
                    const isSelected = formData.new_location_id === location.id
                    
                    return (
                      <button
                        key={location.id}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, new_location_id: location.id }))}
                        className={`
                          flex items-center space-x-2 p-3 rounded-xl border-2 transition-all text-sm min-h-[48px]
                          ${isSelected 
                            ? 'bg-orange-500/20 border-orange-500 text-orange-700' 
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-orange-50 hover:border-orange-300'
                          }
                        `}
                      >
                        <LocationIcon className="w-4 h-4" />
                        <span className="font-medium truncate">{location.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Full Location Dropdown */}
            <select
              value={formData.new_location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, new_location_id: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 min-h-[56px]"
              required
            >
              <option value="">Select Destination Location</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} {location.address && `- ${location.address}`}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Reason */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-1" />
              Transfer Reason
            </label>
            <select
              value={formData.transfer_reason}
              onChange={(e) => setFormData(prev => ({ ...prev, transfer_reason: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 min-h-[56px]"
            >
              <option value="">Select Reason</option>
              {transferReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* Assign To User */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <User className="w-4 h-4 inline mr-1" />
              Assign To
            </label>
            <select
              value={formData.assigned_to}
              onChange={(e) => setFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 min-h-[56px]"
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} {user.role && `(${user.role})`}
                </option>
              ))}
            </select>
          </div>

          {/* Transfer Date */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Transfer Date
            </label>
            <input
              type="date"
              value={formData.transfer_date}
              onChange={(e) => setFormData(prev => ({ ...prev, transfer_date: e.target.value }))}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 min-h-[56px]"
              required
            />
          </div>

          {/* Transfer Notes */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Transfer Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Additional details about this transfer (e.g., 'Needed urgently for foundation work')"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900 resize-none"
            />
          </div>

          {/* Action Buttons - Construction-Worker Optimized */}
          <div className="grid grid-cols-1 gap-3">
            {/* Transfer Button - Primary Action */}
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-xl py-4 px-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 min-h-[56px] disabled:opacity-50 disabled:transform-none"
            >
              <ArrowUpDown className="w-6 h-6" />
              <span className="font-semibold text-lg">
                {loading ? 'Transferring...' : 'Complete Transfer'}
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
          <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-semibold text-orange-800 mb-2 flex items-center space-x-2">
              <Truck className="w-4 h-4" />
              <span>Transfer Speed</span>
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Traditional Paperwork:</p>
                <p className="font-semibold text-red-600">~15 minutes</p>
                <p className="text-xs text-gray-500">Forms, signatures, filing</p>
              </div>
              <div>
                <p className="text-gray-600">Pontifex Quick Move:</p>
                <p className="font-semibold text-orange-600">~2 minutes</p>
                <p className="text-xs text-gray-500">Tap, select, transfer - done!</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}