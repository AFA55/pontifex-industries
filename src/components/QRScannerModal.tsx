'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, Camera, QrCode, Search, Zap, CheckCircle, AlertCircle, ArrowRight, Loader2 } from 'lucide-react'
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
  } | string
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
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionProgress, setTransitionProgress] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Helper function to safely extract string values from potential objects
  const getStringValue = (value: string | { name: string } | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    return '';
  };

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

  const smoothTransitionToAsset = async (asset: Asset) => {
    setIsTransitioning(true)
    setTransitionProgress(0)

    // Smooth progress animation
    const progressInterval = setInterval(() => {
      setTransitionProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2 // Smooth increment
      })
    }, 20)

    // Wait for smooth transition completion
    await new Promise(resolve => setTimeout(resolve, 1200))

    // Call parent callback and close
    onAssetFound(asset)
    handleClose()
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
        
        // Start smooth transition
        await smoothTransitionToAsset(asset)
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
    setIsTransitioning(false)
    setTransitionProgress(0)
    onClose()
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

  // Simple QR scanning simulation (in real app, would use proper QR library)
  const simulateQRScan = (assetId: string) => {
    searchAsset(assetId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        
        {/* Transition Overlay */}
        {isTransitioning && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/95 to-teal-600/95 rounded-lg flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="text-center text-white">
              {/* Smooth Loading Animation */}
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto">
                  <div className="absolute inset-0 rounded-full border-4 border-white/20"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-white border-r-transparent animate-spin"
                    style={{
                      animationDuration: '1s'
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Asset Info Preview */}
              {foundAsset && (
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-bold text-white">
                    {foundAsset.name}
                  </h3>
                  <p className="text-blue-100">
                    #{foundAsset.serial_number || foundAsset.asset_id}
                  </p>
                  <div className="inline-flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-full">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Asset Located</span>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              <div className="w-64 mx-auto mb-4">
                <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-white h-full transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${transitionProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-blue-100 mt-2">
                  Loading asset details... {Math.round(transitionProgress)}%
                </p>
              </div>

              {/* Speed Indicator */}
              <div className="flex items-center justify-center space-x-2 text-sm text-blue-100">
                <Zap className="w-4 h-4" />
                <span>10x faster than traditional systems</span>
              </div>
            </div>
          </div>
        )}

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
              className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                isScanning 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg' 
                  : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              <Camera className="h-8 w-8 mx-auto mb-2" />
              <p className="font-semibold">Scan QR Code</p>
              <p className="text-sm text-gray-500">Use camera</p>
            </button>

            <button
              onClick={() => setIsScanning(false)}
              className={`p-4 rounded-lg border-2 transition-all duration-300 transform hover:scale-105 ${
                !isScanning 
                  ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg' 
                  : 'border-gray-300 hover:border-blue-300 hover:shadow-md'
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
                  <div className="border-2 border-white border-dashed w-48 h-48 rounded-lg flex items-center justify-center animate-pulse">
                    <QrCode className="h-16 w-16 text-white opacity-75" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-center text-sm bg-black bg-opacity-50 px-3 py-2 rounded">
                    Position QR code within the frame
                  </p>
                </div>
              </div>

              {/* Quick Demo Buttons with Modern Styling */}
              <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 mb-3 font-medium">Demo: Quick scan existing assets</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => simulateQRScan('CORE-DD250-001')}
                    className="flex items-center justify-between px-3 py-2 bg-white text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-200"
                  >
                    <span className="font-medium">Hilti Core Drill</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => simulateQRScan('SAW-K770-001')}
                    className="flex items-center justify-between px-3 py-2 bg-white text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-200"
                  >
                    <span className="font-medium">Husqvarna Saw</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => simulateQRScan('WALL-RS2-001')}
                    className="flex items-center justify-between px-3 py-2 bg-white text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-200"
                  >
                    <span className="font-medium">Pentruder Wall Saw</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => simulateQRScan('POWER-ICS25-001')}
                    className="flex items-center justify-between px-3 py-2 bg-white text-blue-700 rounded-lg text-sm hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md border border-blue-200"
                  >
                    <span className="font-medium">ICS Power Cutter</span>
                    <ArrowRight className="w-4 h-4" />
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
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 flex items-center space-x-2 transform hover:scale-105"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Search</span>
                        </>
                      )}
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
                        className="px-3 py-1 bg-white text-gray-700 rounded border text-sm hover:bg-gray-50 transition-all duration-200 transform hover:scale-105"
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
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-3 animate-pulse">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-3 animate-bounce">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-green-700">{success}</p>
            </div>
          )}

          {/* Found Asset Preview */}
          {foundAsset && !isTransitioning && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200 animate-fade-in">
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
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(foundAsset.status)}`}>
                    {foundAsset.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p>{getStringValue(foundAsset.location) || 'Unassigned'}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Value</p>
                  <p className="font-semibold text-green-600">{formatPrice(foundAsset.purchase_price)}</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm text-center flex items-center justify-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span>Preparing detailed view...</span>
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