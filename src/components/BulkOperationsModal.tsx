'use client'

import React, { useState, useEffect } from 'react'
import { X, CheckSquare, Square, ArrowUpDown, Edit3, Users, Zap, Clock, Target, CheckCircle, AlertTriangle, Circle, MapPin, Truck, Wrench, Camera, QrCode, Plus, Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/use-toast'

interface BulkOperationsModalProps {
  isOpen: boolean
  onClose: () => void
  assets: Array<{
    id: string
    asset_id?: string
    name?: string
    status: 'available' | 'in_use' | 'maintenance' | 'offline'
    location?: string
    current_location_id?: string
    assigned_to?: string
    category?: string
    serial_number?: string
    brand?: string
  }>
  onAssetsUpdated: () => void
}

type BulkAction = 'transfer' | 'status' | 'assign' | null

interface BulkFormData {
  action: BulkAction
  new_location_id?: string
  new_status?: 'available' | 'in_use' | 'maintenance' | 'offline'
  assignment_type?: 'operator' | 'truck' | 'shop_north' | 'shop_west' | 'other'
  assigned_to?: string
  truck_id?: string
  other_location?: string
  notes?: string
}

export default function BulkOperationsModal({ isOpen, onClose, assets, onAssetsUpdated }: BulkOperationsModalProps) {
  const [selectedAssets, setSelectedAssets] = useState<Set<string>>(new Set())
  const [bulkFormData, setBulkFormData] = useState<BulkFormData>({ action: null })
  const [loading, setLoading] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [locations, setLocations] = useState<Array<{id: string, name: string}>>([])
  const [users, setUsers] = useState<Array<{id: string, name: string, role?: string}>>([])
  const [trucks, setTrucks] = useState<Array<{id: string, name: string}>>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [completionTime, setCompletionTime] = useState<number | null>(null)
  
  // QR Scanner States
  const [showQRCamera, setShowQRCamera] = useState(false)
  const [qrScannerStream, setQrScannerStream] = useState<MediaStream | null>(null)
  const [scannedAssets, setScannedAssets] = useState<Set<string>>(new Set())
  const [lastScannedAsset, setLastScannedAsset] = useState<BulkOperationsModalProps['assets'][0] | null>(null)
  
  const { toast } = useToast()

  // Status configurations
  const statusConfig = {
    available: { color: 'text-green-600', label: 'Available' },
    in_use: { color: 'text-orange-600', label: 'In Use' },
    maintenance: { color: 'text-red-600', label: 'Maintenance' },
    offline: { color: 'text-gray-600', label: 'Offline' }
  }

  // Helper function to get status icon
  const getStatusIcon = (status: 'available' | 'in_use' | 'maintenance' | 'offline') => {
    switch (status) {
      case 'available':
        return CheckCircle
      case 'in_use':
        return Circle
      case 'maintenance':
        return AlertTriangle
      case 'offline':
        return Circle
      default:
        return Circle
    }
  }

  // Load supporting data
  useEffect(() => {
    if (isOpen) {
      loadLocations()
      loadUsers()
      loadTrucks()
      // Reset state
      setSelectedAssets(new Set())
      setScannedAssets(new Set())
      setBulkFormData({ action: null })
      setProcessingProgress(0)
      setStartTime(null)
      setCompletionTime(null)
      setShowQRCamera(false)
      setLastScannedAsset(null)
    }
  }, [isOpen])

  // Cleanup camera stream on unmount and modal close
  useEffect(() => {
    return () => {
      if (qrScannerStream) {
        qrScannerStream.getTracks().forEach(track => track.stop())
        setQrScannerStream(null)
      }
    }
  }, [qrScannerStream])

  // Clean up camera when modal closes
  useEffect(() => {
    if (!isOpen && qrScannerStream) {
      qrScannerStream.getTracks().forEach(track => track.stop())
      setQrScannerStream(null)
      setShowQRCamera(false)
    }
  }, [isOpen, qrScannerStream])

  const loadLocations = async () => {
    try {
      const { data } = await supabase
        .from('locations')
        .select('id, name')
        .order('name')
      setLocations(data || [])
    } catch (error) {
      console.error('Error loading locations:', error)
    }
  }

  const loadUsers = async () => {
    // Real Pontifex Industries operators for authentic demo
    setUsers([
      { id: 'user1', name: 'Andres Altamirano', role: 'Operator' },
      { id: 'user2', name: 'Skinny', role: 'Operator' },
      { id: 'user3', name: 'Leo Hernandez', role: 'Operator' },
      { id: 'user4', name: 'Wynn Duncan', role: 'Operator' },
      { id: 'user5', name: 'Rex Zaragoza', role: 'Operator' },
      { id: 'user6', name: 'Brandon Ruiz', role: 'Operator' },
      { id: 'user7', name: 'Lonnie Duncan', role: 'Operator' },
      { id: 'user8', name: 'Gabriel Mora', role: 'Operator' },
      { id: 'unassigned', name: 'Unassigned', role: 'Equipment Pool' }
    ])
  }

  const loadTrucks = async () => {
    // Pontifex Industries fleet trucks
    setTrucks([
      { id: 'truck001', name: 'Truck 001' },
      { id: 'truck002', name: 'Truck 002' },
      { id: 'truck003', name: 'Truck 003' },
      { id: 'truck004', name: 'Truck 004' },
      { id: 'truck005', name: 'Truck 005' },
      { id: 'truck006', name: 'Truck 006' },
      { id: 'truck007', name: 'Truck 007' },
      { id: 'truck008', name: 'Truck 008' },
      { id: 'truck009', name: 'Truck 009' },
      { id: 'truck010', name: 'Truck 010' }
    ])
  }

  // Selection handlers
  const toggleAsset = (assetId: string) => {
    const newSelected = new Set(selectedAssets)
    if (newSelected.has(assetId)) {
      newSelected.delete(assetId)
    } else {
      newSelected.add(assetId)
    }
    setSelectedAssets(newSelected)
  }

  const selectAll = () => {
    setSelectedAssets(new Set(assets.map(asset => asset.id)))
  }

  const selectNone = () => {
    setSelectedAssets(new Set())
  }

  const selectByStatus = (status: 'available' | 'in_use' | 'maintenance' | 'offline') => {
    const filtered = assets.filter(asset => asset.status === status)
    setSelectedAssets(new Set(filtered.map(asset => asset.id)))
  }

  const selectByCategory = (category: string) => {
    const filtered = assets.filter(asset => asset.category === category)
    setSelectedAssets(new Set(filtered.map(asset => asset.id)))
  }

  // QR Camera Functions
  const startQRCamera = async () => {
    try {
      // Stop existing stream first
      if (qrScannerStream) {
        qrScannerStream.getTracks().forEach(track => track.stop())
        setQrScannerStream(null)
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      setQrScannerStream(stream)
      setShowQRCamera(true)
      
      toast({
        title: "Camera Started",
        description: "Point camera at QR codes to scan assets",
        variant: "default"
      })
    } catch (error) {
      console.error('Camera access error:', error)
      toast({
        title: "Camera Access Failed",
        description: "Please allow camera permissions for QR scanning",
        variant: "destructive"
      })
    }
  }

  const stopQRCamera = () => {
    if (qrScannerStream) {
      qrScannerStream.getTracks().forEach(track => track.stop())
      setQrScannerStream(null)
    }
    setShowQRCamera(false)
    setLastScannedAsset(null)
  }

  // Simulate QR Code Detection (in production, use a QR scanning library)
  const simulateQRScan = (assetId: string) => {
    const asset = assets.find(a => a.asset_id === assetId || a.id === assetId)
    if (asset) {
      setLastScannedAsset(asset)
      toast({
        title: "QR Code Detected!",
        description: `Found: ${asset.name || 'Asset'}`,
        variant: "default"
      })
    }
  }

  // Add scanned asset to selection
  const addScannedAsset = () => {
    if (lastScannedAsset) {
      const newSelected = new Set(selectedAssets)
      const newScanned = new Set(scannedAssets)
      
      newSelected.add(lastScannedAsset.id)
      newScanned.add(lastScannedAsset.id)
      
      setSelectedAssets(newSelected)
      setScannedAssets(newScanned)
      setLastScannedAsset(null)
      
      toast({
        title: "Asset Added!",
        description: `${lastScannedAsset.name || 'Asset'} added to bulk operation`,
        variant: "default"
      })
    }
  }

  // Done with QR scanning
  const finishQRScanning = () => {
    stopQRCamera()
    toast({
      title: "QR Scanning Complete",
      description: `Added ${scannedAssets.size} assets via QR scanning`,
      variant: "default"
    })
  }

  const clearScannedAssets = () => {
    // Remove only scanned assets from selection
    const newSelected = new Set(selectedAssets)
    scannedAssets.forEach(assetId => {
      newSelected.delete(assetId)
    })
    setSelectedAssets(newSelected)
    setScannedAssets(new Set())
  }

  // Get unique values for smart selection
  const uniqueCategories = [...new Set(assets.map(asset => asset.category).filter(Boolean))] as string[]

  // Type-safe status keys
  const statusKeys: Array<'available' | 'in_use' | 'maintenance' | 'offline'> = ['available', 'in_use', 'maintenance', 'offline']

  // Bulk operation execution
  const executeBulkOperation = async () => {
    if (selectedAssets.size === 0) {
      toast({
        title: "No Assets Selected",
        description: "Please select at least one asset",
        variant: "destructive"
      })
      return
    }

    if (!bulkFormData.action) {
      toast({
        title: "No Action Selected",
        description: "Please choose a bulk action",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setStartTime(Date.now())
    setProcessingProgress(0)

    try {
      const selectedAssetIds = Array.from(selectedAssets)
      const totalAssets = selectedAssetIds.length

      // Process assets in batches for better UX
      const batchSize = 10
      let processed = 0

      for (let i = 0; i < selectedAssetIds.length; i += batchSize) {
        const batch = selectedAssetIds.slice(i, i + batchSize)
        
        // Update based on action type
        const updateData: Record<string, string | null> = {
          last_updated: new Date().toISOString()
        }

        switch (bulkFormData.action) {
          case 'transfer':
            if (bulkFormData.new_location_id) {
              updateData.current_location_id = bulkFormData.new_location_id
            }
            break
          
          case 'status':
            if (bulkFormData.new_status) {
              updateData.status = bulkFormData.new_status
            }
            break
          
          case 'assign':
            // Handle different assignment types
            switch (bulkFormData.assignment_type) {
              case 'operator':
                updateData.assigned_to = bulkFormData.assigned_to === 'unassigned' ? null : (bulkFormData.assigned_to || null)
                updateData.assigned_type = 'operator'
                break
              case 'truck':
                updateData.assigned_to = bulkFormData.truck_id || null
                updateData.assigned_type = 'truck'
                break
              case 'shop_north':
                updateData.assigned_to = 'North Side Shop'
                updateData.assigned_type = 'shop'
                break
              case 'shop_west':
                updateData.assigned_to = 'West Side Shop'
                updateData.assigned_type = 'shop'
                break
              case 'other':
                updateData.assigned_to = bulkFormData.other_location || 'Other Location'
                updateData.assigned_type = 'other'
                break
            }
            break
        }

        // Execute batch update
        const { error } = await supabase
          .from('assets')
          .update(updateData)
          .in('id', batch)

        if (error) throw error

        processed += batch.length
        setProcessingProgress((processed / totalAssets) * 100)

        // Small delay for demo effect
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      // Log bulk operation for audit trail (optional)
      try {
        await supabase
          .from('asset_activities')
          .insert([{
            asset_id: selectedAssetIds[0], // Representative asset
            activity_type: 'bulk_operation',
            description: `Bulk ${bulkFormData.action}: ${selectedAssetIds.length} assets processed`,
            created_at: new Date().toISOString()
          }])
      } catch (auditError) {
        console.log('Audit logging failed:', auditError)
      }

      const endTime = Date.now()
      setCompletionTime(endTime)
      
      // Success!
      toast({
        title: "Bulk Operation Complete!",
        description: `Successfully processed ${selectedAssets.size} assets in ${((endTime - (startTime || 0)) / 1000).toFixed(1)} seconds`,
        variant: "default"
      })

      onAssetsUpdated()
      
      // Clean up camera if it's still running
      if (qrScannerStream) {
        qrScannerStream.getTracks().forEach(track => track.stop())
        setQrScannerStream(null)
        setShowQRCamera(false)
      }
      
      // Show completion for a moment before closing
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Bulk operation error:', error)
      toast({
        title: "Bulk Operation Failed",
        description: "Some assets may not have been updated. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Calculate Hilti comparison time
  const hiltiTime = selectedAssets.size * 45 // 45 seconds per asset for Hilti
  const pontifexTime = Math.max(2, selectedAssets.size * 0.5) // 0.5 seconds per asset

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-y-auto">
        {/* Header - Executive Impact */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-4">
            <Target className="h-8 w-8" />
            <div>
              <h2 className="text-2xl font-bold">Bulk Operations</h2>
              <p className="text-purple-100">Process hundreds of assets in seconds</p>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded-full">
              <span className="font-bold">100x Faster than Hilti</span>
            </div>
          </div>
          <button 
            onClick={() => {
              // Clean up camera before closing
              if (qrScannerStream) {
                qrScannerStream.getTracks().forEach(track => track.stop())
                setQrScannerStream(null)
              }
              onClose()
            }}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-8 w-8" />
          </button>
        </div>

        {/* QR Camera Modal */}
        {showQRCamera && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[60]">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="text-center mb-4">
                <Camera className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="text-xl font-bold">QR Scanner</h3>
                <p className="text-gray-600">Point camera at QR codes</p>
              </div>

              {/* Camera Video Feed */}
              <div className="relative bg-gray-900 rounded-lg mb-4 aspect-video">
                {qrScannerStream && (
                  <video
                    ref={(video) => {
                      if (video && qrScannerStream) {
                        video.srcObject = qrScannerStream
                        // Handle play() promise to avoid uncaught rejection
                        const playPromise = video.play()
                        if (playPromise !== undefined) {
                          playPromise.catch((error) => {
                            console.log("Video play failed:", error)
                            // This is normal when switching between components
                          })
                        }
                      }
                    }}
                    className="w-full h-full object-cover rounded-lg"
                    autoPlay
                    playsInline
                    muted
                  />
                )}
                
                {/* QR Scanning Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-green-400 border-dashed w-48 h-48 rounded-lg animate-pulse">
                    <QrCode className="w-8 h-8 text-green-400 absolute top-2 left-2" />
                  </div>
                </div>
              </div>

              {/* Demo QR Scan Buttons (for Thursday demo) */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Demo Mode - Simulate QR Scanning:</p>
                <div className="grid grid-cols-2 gap-2">
                  {assets.slice(0, 4).map(asset => (
                    <button
                      key={asset.id}
                      onClick={() => simulateQRScan(asset.asset_id || asset.id)}
                      className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-sm text-blue-700 transition-colors"
                    >
                      Scan {asset.name?.slice(0, 8) || 'Asset'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Last Scanned Asset */}
              {lastScannedAsset && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-800">
                        ✅ {lastScannedAsset.name || 'Asset Detected'}
                      </p>
                      <p className="text-sm text-green-600">
                        #{lastScannedAsset.serial_number || lastScannedAsset.asset_id}
                      </p>
                    </div>
                    <button
                      onClick={addScannedAsset}
                      className="flex items-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Scanning Status */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-blue-700">
                    Assets Added: {scannedAssets.size}
                  </span>
                  <div className="flex items-center text-green-600">
                    <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm">Camera Active</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={finishQRScanning}
                  className="flex-1 bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Done Adding ({scannedAssets.size})</span>
                </button>
                <button
                  onClick={() => {
                    if (qrScannerStream) {
                      qrScannerStream.getTracks().forEach(track => track.stop())
                      setQrScannerStream(null)
                    }
                    setShowQRCamera(false)
                    setLastScannedAsset(null)
                  }}
                  className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
          {/* Left Panel - Asset Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selection Controls */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
              <h3 className="font-bold text-lg mb-4 flex items-center space-x-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span>Smart Selection ({selectedAssets.size} of {assets.length} selected)</span>
              </h3>
              
              {/* Quick Selection Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
                <button
                  onClick={selectAll}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={selectNone}
                  className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Select None
                </button>
                <button
                  onClick={startQRCamera}
                  disabled={showQRCamera}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>QR Scan</span>
                </button>
                {scannedAssets.size > 0 && (
                  <button
                    onClick={clearScannedAssets}
                    className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                  >
                    Clear Scanned ({scannedAssets.size})
                  </button>
                )}
              </div>

              {/* Smart Filters */}
              <div className="space-y-3">
                {/* By Status */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">By Status:</p>
                  <div className="flex flex-wrap gap-2">
                    {statusKeys.filter(status => assets.some(a => a.status === status)).map(status => {
                      const config = statusConfig[status]
                      const StatusIcon = getStatusIcon(status)
                      const count = assets.filter(a => a.status === status).length
                      return (
                        <button
                          key={status}
                          onClick={() => selectByStatus(status)}
                          className={`flex items-center space-x-2 px-3 py-1 rounded-lg border transition-colors text-sm`}
                          style={{ 
                            backgroundColor: config.color.includes('green') ? '#f0fdf4' : 
                                           config.color.includes('orange') ? '#fff7ed' :
                                           config.color.includes('red') ? '#fef2f2' : '#f9fafb',
                            borderColor: config.color.includes('green') ? '#bbf7d0' : 
                                        config.color.includes('orange') ? '#fed7aa' :
                                        config.color.includes('red') ? '#fecaca' : '#e5e7eb'
                          }}
                        >
                          <StatusIcon className={`w-4 h-4 ${config.color}`} />
                          <span>{config.label} ({count})</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* By Category */}
                {uniqueCategories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">By Category:</p>
                    <div className="flex flex-wrap gap-2">
                      {uniqueCategories.slice(0, 4).map(category => {
                        const count = assets.filter(a => a.category === category).length
                        return (
                          <button
                            key={category}
                            onClick={() => selectByCategory(category)}
                            className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors text-sm"
                          >
                            {category} ({count})
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Asset List with Checkboxes */}
            <div className="bg-white border border-gray-200 rounded-xl max-h-96 overflow-y-auto">
              {assets.map(asset => {
                const isSelected = selectedAssets.has(asset.id)
                const isScanned = scannedAssets.has(asset.id)
                const status = asset.status || 'offline'
                const statusInfo = statusConfig[status]
                const StatusIcon = getStatusIcon(status)
                
                return (
                  <div
                    key={asset.id}
                    className={`flex items-center space-x-4 p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    } ${isScanned ? 'ring-2 ring-green-300' : ''}`}
                    onClick={() => toggleAsset(asset.id)}
                  >
                    {/* Checkbox */}
                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Square className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* QR Scan Indicator */}
                    {isScanned && (
                      <div className="flex-shrink-0">
                        <QrCode className="w-5 h-5 text-green-600" />
                      </div>
                    )}

                    {/* Asset Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <Wrench className="w-5 h-5 text-gray-500" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {asset.name || 'Unnamed Asset'}
                            {isScanned && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">QR Scanned</span>}
                          </p>
                          <p className="text-sm text-gray-600">
                            #{asset.serial_number || asset.asset_id || asset.id.slice(0, 8)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                        <span className={`text-sm ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex-shrink-0">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{asset.location || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Panel - Bulk Actions */}
          <div className="space-y-6">
            {/* Speed Comparison - Executive Eye-Catcher */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
              <h3 className="font-bold text-lg mb-3 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span>Speed Advantage</span>
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Selected Assets:</span>
                  <span className="font-bold text-lg">{selectedAssets.size}</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-red-600">Hilti ON!Track:</span>
                    <span className="font-semibold text-red-600">
                      {Math.floor(hiltiTime / 60)}m {hiltiTime % 60}s
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-green-600">Pontifex:</span>
                    <span className="font-semibold text-green-600">
                      {pontifexTime.toFixed(1)}s
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Speed Advantage:</span>
                      <span className="font-bold text-blue-600">
                        {Math.floor(hiltiTime / pontifexTime)}x faster
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Selection */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-bold text-lg mb-4">Choose Action</h3>
              
              <div className="space-y-3">
                {/* Transfer Action */}
                <button
                  onClick={() => setBulkFormData({ action: 'transfer' })}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                    bulkFormData.action === 'transfer'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  <ArrowUpDown className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold">Bulk Transfer</p>
                    <p className="text-sm opacity-75">Move to new location</p>
                  </div>
                </button>

                {/* Status Update Action */}
                <button
                  onClick={() => setBulkFormData({ action: 'status' })}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                    bulkFormData.action === 'status'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <Edit3 className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold">Update Status</p>
                    <p className="text-sm opacity-75">Change status for all</p>
                  </div>
                </button>

                {/* Assignment Action */}
                <button
                  onClick={() => setBulkFormData({ action: 'assign' })}
                  className={`w-full flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                    bulkFormData.action === 'assign'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  <Users className="w-6 h-6" />
                  <div className="text-left">
                    <p className="font-semibold">Assign Users</p>
                    <p className="text-sm opacity-75">Bulk user assignment</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Action-Specific Forms */}
            {bulkFormData.action === 'transfer' && (
              <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                <h4 className="font-semibold mb-3">Transfer Options</h4>
                <select
                  value={bulkFormData.new_location_id || ''}
                  onChange={(e) => setBulkFormData(prev => ({ ...prev, new_location_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Select Location</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {bulkFormData.action === 'status' && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <h4 className="font-semibold mb-3">Status Options</h4>
                <div className="grid grid-cols-2 gap-2">
                  {statusKeys.map((status) => {
                    const config = statusConfig[status]
                    const StatusIcon = getStatusIcon(status)
                    return (
                      <button
                        key={status}
                        onClick={() => setBulkFormData(prev => ({ ...prev, new_status: status }))}
                        className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                          bulkFormData.new_status === status
                            ? 'border-green-500 bg-green-100'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <StatusIcon className={`w-4 h-4 ${config.color}`} />
                        <span className="text-sm">{config.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {bulkFormData.action === 'assign' && (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <h4 className="font-semibold mb-3">Assignment Options</h4>
                
                {/* Assignment Type Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setBulkFormData(prev => ({ ...prev, assignment_type: 'operator' }))}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        bulkFormData.assignment_type === 'operator'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <Users className="w-4 h-4 mx-auto mb-1" />
                      Operator
                    </button>
                    <button
                      onClick={() => setBulkFormData(prev => ({ ...prev, assignment_type: 'truck' }))}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        bulkFormData.assignment_type === 'truck'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <Truck className="w-4 h-4 mx-auto mb-1" />
                      Truck
                    </button>
                    <button
                      onClick={() => setBulkFormData(prev => ({ ...prev, assignment_type: 'shop_north' }))}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        bulkFormData.assignment_type === 'shop_north'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      North Shop
                    </button>
                    <button
                      onClick={() => setBulkFormData(prev => ({ ...prev, assignment_type: 'shop_west' }))}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        bulkFormData.assignment_type === 'shop_west'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      West Shop
                    </button>
                  </div>
                  
                  <button
                    onClick={() => setBulkFormData(prev => ({ ...prev, assignment_type: 'other' }))}
                    className={`w-full mt-2 p-3 rounded-lg border transition-all text-sm ${
                      bulkFormData.assignment_type === 'other'
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    Other Location
                  </button>
                </div>

                {/* Operator Selection */}
                {bulkFormData.assignment_type === 'operator' && (
                  <select
                    value={bulkFormData.assigned_to || ''}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, assigned_to: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Operator</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.role && `(${user.role})`}
                      </option>
                    ))}
                  </select>
                )}

                {/* Truck Selection */}
                {bulkFormData.assignment_type === 'truck' && (
                  <select
                    value={bulkFormData.truck_id || ''}
                    onChange={(e) => setBulkFormData(prev => ({ ...prev, truck_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Truck</option>
                    {trucks.map(truck => (
                      <option key={truck.id} value={truck.id}>
                        {truck.name}
                      </option>
                    ))}
                  </select>
                )}

                {/* Other Location Input */}
                {bulkFormData.assignment_type === 'other' && (
                  <div>
                    <input
                      type="text"
                      value={bulkFormData.other_location || ''}
                      onChange={(e) => setBulkFormData(prev => ({ ...prev, other_location: e.target.value }))}
                      placeholder="Enter custom location (e.g., 'ABC Repair Shop', 'Site C Storage')"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Use for mechanic shops, temporary storage, or off-site locations
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Processing Progress */}
            {loading && (
              <div className="bg-purple-50 rounded-xl border border-purple-200 p-4">
                <h4 className="font-semibold mb-3 flex items-center space-x-2">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </h4>
                <div className="space-y-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${processingProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-purple-700">
                    {processingProgress.toFixed(0)}% complete
                  </p>
                  {startTime && (
                    <p className="text-xs text-purple-600">
                      Elapsed: {((Date.now() - startTime) / 1000).toFixed(1)}s
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Completion Status */}
            {completionTime && startTime && (
              <div className="bg-green-50 rounded-xl border border-green-200 p-4">
                <h4 className="font-semibold mb-2 flex items-center space-x-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span>Operation Complete!</span>
                </h4>
                <p className="text-sm text-green-600">
                  Processed {selectedAssets.size} assets in {((completionTime - startTime) / 1000).toFixed(1)} seconds
                </p>
                <p className="text-xs text-green-500 mt-1">
                  Hilti would have taken {Math.floor(hiltiTime / 60)}m {hiltiTime % 60}s
                </p>
              </div>
            )}

            {/* Execute Button */}
            <button
              onClick={executeBulkOperation}
              disabled={loading || selectedAssets.size === 0 || !bulkFormData.action}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl py-4 px-6 font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Truck className="w-6 h-6" />
                  <span>Execute Bulk Operation</span>
                </div>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}