'use client'

import React, { useState, useEffect } from 'react'
import { X, Edit, Save, QrCode, MapPin, Calendar, DollarSign, Wrench, Trash2, ArrowRight, Camera } from 'lucide-react'
import { supabase } from '@/lib/supabase'


interface Asset {
  id: string
  asset_id: string
  name: string
  description: string
  category: string
  brand: string
  model: string
  status: string
  current_location_id: string
  purchase_date: string
  purchase_price: number
  serial_number: string
  qr_code?: string
  photo_url?: string
  location?: {
    name: string
  }
}

interface AssetDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  asset: Asset | null
  onAssetUpdated: () => void
}

export default function AssetDetailsModal({ isOpen, onClose, asset, onAssetUpdated }: AssetDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [locations, setLocations] = useState<Array<{id: string, name: string}>>([])
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [maintenanceReason, setMaintenanceReason] = useState('')
  const [editData, setEditData] = useState({
    name: '',
    description: '',
    status: '',
    current_location_id: '',
    purchase_price: 0
  })

  useEffect(() => {
    if (isOpen && asset) {
      loadLocations()
      setEditData({
        name: asset.name || '',
        description: asset.description || '',
        status: asset.status || 'available',
        current_location_id: asset.current_location_id || '',
        purchase_price: asset.purchase_price || 0
      })
    }
  }, [isOpen, asset])

  const loadLocations = async () => {
    const { data } = await supabase
      .from('locations')
      .select('id, name')
      .order('name')
    
    if (data) setLocations(data)
  }

  const handleSave = async () => {
    if (!asset) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('assets')
        .update(editData)
        .eq('id', asset.id)

      if (error) throw error

      setIsEditing(false)
      onAssetUpdated()
      alert('Asset updated successfully! ⚡')
    } catch (error) {
      console.error('Error updating asset:', error)
      alert('Error updating asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = async (action: string) => {
    if (!asset) return
    
    // Special handling for maintenance - show reason modal
    if (action === 'maintenance') {
      setShowMaintenanceModal(true)
      return
    }
    
    let updateData: { status: string } = { status: '' }
    let message = ''

    switch (action) {
      case 'available':
        updateData = { status: 'available' }
        message = 'Asset marked as available'
        break
      case 'in_use':
        updateData = { status: 'in_use' }
        message = 'Asset marked as in use'
        break
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('assets')
        .update(updateData)
        .eq('id', asset.id)

      if (error) throw error

      onAssetUpdated()
      alert(`${message} ⚡`)
    } catch (error) {
      console.error('Error updating asset:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMaintenanceSubmit = async () => {
    if (!asset || !maintenanceReason.trim()) {
      alert('Please provide a maintenance reason')
      return
    }

    setLoading(true)
    try {
      // Update asset status to maintenance
      const { error: updateError } = await supabase
        .from('assets')
        .update({ 
          status: 'maintenance',
          description: `${asset.description || ''}\n\nMaintenance: ${maintenanceReason} (${new Date().toLocaleDateString()})`
        })
        .eq('id', asset.id)

      if (updateError) throw updateError

      onAssetUpdated()
      setShowMaintenanceModal(false)
      setMaintenanceReason('')
      alert('Asset sent to maintenance with reason logged ⚡')
    } catch (error) {
      console.error('Error updating asset:', error)
      alert('Error updating asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const downloadQRCode = () => {
    if (!asset) return
    
    // Create QR code URL using qr-server.com API
    const qrText = asset.asset_id
    const qrSize = '300x300'
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}&data=${encodeURIComponent(qrText)}`
    
    // Create download link
    const link = document.createElement('a')
    link.href = qrUrl
    link.download = `${asset.asset_id}-QRCode.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDelete = async () => {
    if (!asset) return
    
    if (!confirm(`Are you sure you want to delete ${asset.name}? This cannot be undone.`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', asset.id)

      if (error) throw error

      onAssetUpdated()
      onClose()
      alert('Asset deleted successfully')
    } catch (error) {
      console.error('Error deleting asset:', error)
      alert('Error deleting asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_use':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen || !asset) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <QrCode className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">{asset.name}</h2>
              <p className="text-blue-100">{asset.asset_id}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(asset.status)}`}>
              {asset.status.replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
              >
                <Edit className="h-4 w-4" />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            )}
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column - Asset Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Equipment Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.name}
                        onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">{asset.name}</p>
                    )}
                  </div>

                  {/* Brand & Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Brand & Model</label>
                    <p className="text-gray-900">{asset.brand} {asset.model}</p>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {asset.category}
                    </span>
                  </div>

                  {/* Serial Number */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Serial Number</label>
                    <p className="text-gray-900 font-mono">{asset.serial_number || 'Not specified'}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    {isEditing ? (
                      <select
                        value={editData.status}
                        onChange={(e) => setEditData(prev => ({ ...prev, status: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="available">Available</option>
                        <option value="in_use">In Use</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                        {asset.status.replace('_', ' ')}
                      </span>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Location</label>
                    {isEditing ? (
                      <select
                        value={editData.current_location_id}
                        onChange={(e) => setEditData(prev => ({ ...prev, current_location_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Location</option>
                        {locations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        {asset.location?.name || 'Unassigned'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  {isEditing ? (
                    <textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{asset.description || 'No description provided'}</p>
                  )}
                </div>
              </div>

              {/* Financial Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                  Financial Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Price</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="0.01"
                        value={editData.purchase_price}
                        onChange={(e) => setEditData(prev => ({ ...prev, purchase_price: parseFloat(e.target.value) }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="flex items-center text-gray-900 font-semibold">
                        <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                        {formatPrice(asset.purchase_price)}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                      {formatDate(asset.purchase_date)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & QR */}
            <div className="space-y-6">
              
              {/* QR Code */}
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code</h3>
                <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(asset.asset_id)}`}
                    alt={`QR Code for ${asset.asset_id}`}
                    width={150}
                    height={150}
                    className="mx-auto mb-2"
                  />
                  <p className="text-sm text-gray-500">QR Code</p>
                  <p className="text-xs text-gray-400 font-mono">{asset.qr_code || asset.asset_id}</p>
                </div>
                <button 
                  onClick={downloadQRCode}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full"
                >
                  Download QR Code
                </button>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  
                  {asset.status !== 'available' && (
                    <button
                      onClick={() => handleQuickAction('available')}
                      disabled={loading}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Mark Available</span>
                    </button>
                  )}

                  {asset.status !== 'in_use' && (
                    <button
                      onClick={() => handleQuickAction('in_use')}
                      disabled={loading}
                      className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <ArrowRight className="h-4 w-4" />
                      <span>Mark In Use</span>
                    </button>
                  )}

                  {asset.status !== 'maintenance' && (
                    <button
                      onClick={() => handleQuickAction('maintenance')}
                      disabled={loading}
                      className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      <Wrench className="h-4 w-4" />
                      <span>Send to Maintenance</span>
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Asset</span>
                  </button>
                </div>
              </div>

              {/* Photo */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Equipment Photo</h3>
                <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No photo available</p>
                  <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Upload Photo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Reason Modal */}
        {showMaintenanceModal && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-orange-500" />
                <span>Send to Maintenance</span>
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maintenance Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={maintenanceReason}
                  onChange={(e) => setMaintenanceReason(e.target.value)}
                  rows={4}
                  placeholder="e.g., Scheduled maintenance, Diamond segments need replacement, Motor repair required..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Quick Reason Buttons */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Quick reasons:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Scheduled maintenance',
                    'Diamond segments replacement',
                    'Motor repair',
                    'Hydraulic system check',
                    'Safety inspection'
                  ].map(reason => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setMaintenanceReason(reason)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowMaintenanceModal(false)
                    setMaintenanceReason('')
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMaintenanceSubmit}
                  disabled={loading || !maintenanceReason.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send to Maintenance'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}