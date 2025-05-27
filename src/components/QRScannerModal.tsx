'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Camera, QrCode, Search, Zap, CheckCircle, AlertCircle } from 'lucide-react'
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
  location?: {
    name: string
  }
}

interface QRScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onAssetFound: (asset: Asset) => void
}

export default function QRScannerModal({ isOpen, onClose, onAssetFound }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [manualInput, setManualInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [foundAsset, setFoundAsset] = useState<Asset | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera()
    }
    return () => {
      stopCamera()
    }
  }, [isOpen, isScanning])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Camera access denied. Please enable camera permissions.')
      setIsScanning(false)
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const searchAsset = async (searchTerm: string) => {
    if (!searchTerm.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      // Get current user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .single()

      if (!profile) throw new Error('User profile not found')

      // Search for asset by asset_id or QR code
      const { data: assets, error } = await supabase
        .from('assets')
        .select(`
          *,
          location:locations!current_location_id(name)
        `)
        .eq('company_id', profile.company_id)
        .or(`asset_id.eq.${searchTerm},qr_code.eq.${searchTerm}`)

      if (error) throw error

      if (assets && assets.length > 0) {
        const asset = assets[0]
        setFoundAsset(asset)
        setSuccess(`Found: ${asset.name}`)
        
        // Call parent callback after short delay
        setTimeout(() => {
          onAssetFound(asset)
          handleClose()
        }, 1500)
      } else {
        setError('Asset not found. Please check the QR code or Asset ID.')
      }
    } catch (error) {
      console.error('Error searching asset:', error)
      setError('Error searching for asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault()
    searchAsset(manualInput)
  }

  const handleClose = () => {
    stopCamera()
    setIsScanning(false)
    setManualInput('')
    setError('')
    setSuccess('')
    setFoundAsset(null)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in_use':
        return 'bg-orange-100 text-orange-800'
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  // Simple QR scanning simulation (in real app, would use proper QR library)
  const simulateQRScan = (assetId: string) => {
    searchAsset(assetId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <QrCode className="h-6 w-6" />
            <div>
              <h2 className="text-2xl font-bold">QR Scanner</h2>
              <p className="text-blue-100">Lightning-fast asset lookup</p>
            </div>
            <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>10x Faster</span>
            </span>
          </div>
          <button 
            onClick={handleClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Scanner Mode Toggle */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => setIsScanning(true)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isScanning 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Scan QR Code</p>
              <p className="text-sm text-gray-500">Use camera</p>
            </button>

            <button
              onClick={() => setIsScanning(false)}
              className={`p-4 rounded-lg border-2 transition-all ${
                !isScanning 
                  ? 'border-blue-500 bg-blue-50 text-blue-600' 
                  : 'border-gray-300 hover:border-blue-300'
              }`}
            >
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Manual Entry</p>
              <p className="text-sm text-gray-500">Type Asset ID</p>
            </button>
          </div>

          {/* Camera Scanner */}
          {isScanning && (
            <div className="mb-6">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center">
                    <QrCode className="h-16 w-16 text-white opacity-75" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-center text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
                    Position QR code within the frame
                  </p>
                </div>
              </div>

              {/* Quick Demo Buttons */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-3">Demo: Quick scan existing assets</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => simulateQRScan('CORE-DD250-001')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    Hilti Core Drill
                  </button>
                  <button
                    onClick={() => simulateQRScan('SAW-K770-001')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    Husqvarna Saw
                  </button>
                  <button
                    onClick={() => simulateQRScan('WALL-RS2-001')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                  >
                    Pentruder Wall Saw
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Manual Input */}
          {!isScanning && (
            <form onSubmit={handleManualSearch} className="mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Asset ID or QR Code
                  </label>
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g., CORE-DD250-001"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                </div>

                {/* Quick Asset ID Examples */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Try these Asset IDs:</p>
                  <div className="flex flex-wrap gap-2">
                    {['CORE-DD250-001', 'SAW-K770-001', 'WALL-RS2-001', 'POWER-ICS25-001'].map(id => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setManualInput(id)}
                        className="px-3 py-1 bg-white text-gray-700 rounded border text-sm hover:bg-gray-50"
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* Status Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Found Asset Preview */}
          {foundAsset && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Asset Found!</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Asset ID</p>
                  <p className="font-semibold">{foundAsset.asset_id}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{foundAsset.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Brand & Model</p>
                  <p>{foundAsset.brand} {foundAsset.model}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(foundAsset.status)}`}>
                    {foundAsset.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p>{foundAsset.location?.name || 'Unassigned'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-semibold text-green-600">{formatPrice(foundAsset.purchase_price)}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-700 text-sm text-center">
                  <Zap className="h-4 w-4 inline mr-1" />
                  Opening detailed view in 1.5 seconds...
                </p>
              </div>
            </div>
          )}

          {/* Speed Comparison */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 p-4 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-gray-800 mb-2">⚡ Pontifex Speed Advantage</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Hilti ON!Track:</p>
                <p className="font-semibold text-red-600">~30 seconds per lookup</p>
                <p className="text-xs text-gray-500">Multiple screens, slow loading</p>
              </div>
              <div>
                <p className="text-gray-600">Pontifex Industries:</p>
                <p className="font-semibold text-green-600">~3 seconds per lookup</p>
                <p className="text-xs text-gray-500">Instant scan, immediate results</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}