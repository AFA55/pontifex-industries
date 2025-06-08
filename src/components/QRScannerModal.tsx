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

  // Simple QR scanning simulation (in real app, would use proper QR library)
  const simulateQRScan = (assetId: string) => {
    searchAsset(assetId)
  }

  if (!isOpen) return null

  return (
    <>
      {/* FIXED: Bulletproof Responsive Modal with Perfect Centering */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
        style={{ 
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          backgroundColor: 'rgba(0, 0, 0, 0.5)'
        }}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto relative"
          style={{
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            width: '100%',
            maxWidth: '48rem',
            maxHeight: '95vh',
            position: 'relative',
            overflowY: 'auto'
          }}
        >
          
          {/* FIXED: Perfect Centered Transition Overlay */}
          {isTransitioning && (
            <div 
              className="absolute inset-0 z-10 rounded-xl"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 10,
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.98) 0%, rgba(20, 184, 166, 0.98) 100%)',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Perfect Centering Container */}
              <div 
                className="flex flex-col items-center justify-center text-center text-white p-8 w-full h-full"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  color: 'white',
                  padding: '2rem',
                  width: '100%',
                  height: '100%'
                }}
              >
                
                {/* Modern Loading Animation */}
                <div 
                  className="relative mb-8"
                  style={{
                    position: 'relative',
                    marginBottom: '2rem'
                  }}
                >
                  <div 
                    className="w-24 h-24 mx-auto"
                    style={{
                      width: '6rem',
                      height: '6rem',
                      margin: '0 auto',
                      position: 'relative'
                    }}
                  >
                    {/* Outer Ring */}
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '4px solid rgba(255, 255, 255, 0.2)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    ></div>
                    {/* Spinning Ring */}
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        border: '4px solid white',
                        borderRightColor: 'transparent',
                        animation: 'spin 1.2s linear infinite'
                      }}
                    ></div>
                    {/* Inner Icon */}
                    <div 
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <QrCode 
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          color: 'white',
                          filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))'
                        }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Asset Info Preview - Perfectly Centered */}
                {foundAsset && (
                  <div 
                    className="w-full max-w-md mb-8"
                    style={{
                      width: '100%',
                      maxWidth: '28rem',
                      marginBottom: '2rem'
                    }}
                  >
                    <div 
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: '1rem',
                        padding: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                      }}
                    >
                      <h3 
                        style={{
                          fontSize: '1.5rem',
                          fontWeight: 'bold',
                          color: 'white',
                          marginBottom: '0.5rem',
                          lineHeight: '1.3'
                        }}
                      >
                        {foundAsset.name}
                      </h3>
                      <p 
                        style={{
                          color: 'rgba(191, 219, 254, 1)',
                          fontSize: '1.125rem',
                          marginBottom: '1rem'
                        }}
                      >
                        #{foundAsset.serial_number || foundAsset.asset_id}
                      </p>
                      <div 
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                          backdropFilter: 'blur(8px)',
                          padding: '0.5rem 1rem',
                          borderRadius: '9999px',
                          border: '1px solid rgba(255, 255, 255, 0.3)'
                        }}
                      >
                        <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span style={{ fontWeight: '500' }}>Asset Located</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Modern Progress Bar */}
                <div 
                  className="w-full max-w-xs mb-6"
                  style={{
                    width: '100%',
                    maxWidth: '20rem',
                    marginBottom: '1.5rem'
                  }}
                >
                  <div 
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '9999px',
                      height: '0.75rem',
                      overflow: 'hidden',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <div 
                      style={{
                        background: 'linear-gradient(90deg, white, rgba(191, 219, 254, 1))',
                        height: '100%',
                        borderRadius: '9999px',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                        width: `${transitionProgress}%`,
                        transition: 'width 0.3s ease-out'
                      }}
                    ></div>
                  </div>
                  <p 
                    style={{
                      color: 'rgba(191, 219, 254, 1)',
                      fontSize: '0.875rem',
                      marginTop: '0.75rem',
                      fontWeight: '500',
                      textAlign: 'center'
                    }}
                  >
                    Loading asset details... {Math.round(transitionProgress)}%
                  </p>
                </div>

                {/* Speed Indicator - Centered */}
                <div 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    color: 'rgba(191, 219, 254, 1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '9999px',
                    border: '1px solid rgba(255, 255, 255, 0.2)'
                  }}
                >
                  <Zap 
                    style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: '#fde047'
                    }} 
                  />
                  <span style={{ fontWeight: '500' }}>10x faster than traditional systems</span>
                </div>
              </div>
            </div>
          )}

          {/* Header */}
          <div 
            className="flex items-center justify-between p-6 border-b text-white rounded-t-xl"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.5rem',
              borderBottom: '1px solid rgba(229, 231, 235, 1)',
              background: 'linear-gradient(90deg, rgb(37, 99, 235), rgb(20, 184, 166))',
              color: 'white',
              borderTopLeftRadius: '0.75rem',
              borderTopRightRadius: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <QrCode style={{ height: '1.5rem', width: '1.5rem' }} />
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>QR Scanner</h2>
                <p style={{ color: 'rgba(191, 219, 254, 1)', fontSize: '0.875rem', margin: 0 }}>Lightning-fast asset lookup</p>
              </div>
              <span 
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <Zap style={{ height: '0.75rem', width: '0.75rem' }} />
                <span>10x Faster</span>
              </span>
            </div>
            <button 
              onClick={handleClose}
              style={{
                color: 'white',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X style={{ height: '1.5rem', width: '1.5rem' }} />
            </button>
          </div>

          <div style={{ padding: '1.5rem' }}>
            {/* Scanner Mode Toggle */}
            <div 
              className="grid grid-cols-2 gap-4 mb-6"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginBottom: '1.5rem'
              }}
            >
              <button
                onClick={() => setIsScanning(true)}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${isScanning ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)'}`,
                  backgroundColor: isScanning ? 'rgb(239, 246, 255)' : 'transparent',
                  color: isScanning ? 'rgb(59, 130, 246)' : 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
              >
                <Camera style={{ height: '2rem', width: '2rem', margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>Scan QR Code</p>
                <p style={{ fontSize: '0.875rem', color: 'rgb(107, 114, 128)', margin: 0 }}>Use camera</p>
              </button>

              <button
                onClick={() => setIsScanning(false)}
                style={{
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: `2px solid ${!isScanning ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)'}`,
                  backgroundColor: !isScanning ? 'rgb(239, 246, 255)' : 'transparent',
                  color: !isScanning ? 'rgb(59, 130, 246)' : 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  textAlign: 'center'
                }}
              >
                <Search style={{ height: '2rem', width: '2rem', margin: '0 auto 0.5rem' }} />
                <p style={{ fontWeight: '600', margin: '0 0 0.25rem 0' }}>Manual Entry</p>
                <p style={{ fontSize: '0.875rem', color: 'rgb(107, 114, 128)', margin: 0 }}>Type Asset ID</p>
              </button>
            </div>

            {/* Camera Scanner */}
            {isScanning && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div 
                  style={{
                    position: 'relative',
                    backgroundColor: 'black',
                    borderRadius: '0.5rem',
                    overflow: 'hidden'
                  }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{
                      width: '100%',
                      height: '16rem',
                      objectFit: 'cover'
                    }}
                  />
                  <div 
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <div 
                      style={{
                        border: '2px dashed white',
                        width: '12rem',
                        height: '12rem',
                        borderRadius: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    >
                      <QrCode style={{ height: '4rem', width: '4rem', color: 'rgba(255, 255, 255, 0.75)' }} />
                    </div>
                  </div>
                  <div 
                    style={{
                      position: 'absolute',
                      bottom: '1rem',
                      left: '1rem',
                      right: '1rem'
                    }}
                  >
                    <p 
                      style={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        padding: '0.75rem',
                        borderRadius: '0.25rem',
                        margin: 0
                      }}
                    >
                      Position QR code within the frame
                    </p>
                  </div>
                </div>

                {/* Quick Demo Buttons */}
                <div 
                  style={{
                    marginTop: '1rem',
                    padding: '1rem',
                    background: 'linear-gradient(90deg, rgb(239, 246, 255), rgb(240, 253, 250))',
                    borderRadius: '0.5rem',
                    border: '1px solid rgb(191, 219, 254)'
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: 'rgb(75, 85, 99)', marginBottom: '0.75rem', fontWeight: '500' }}>
                    Demo: Quick scan existing assets
                  </p>
                  <div 
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.5rem'
                    }}
                  >
                    {[
                      { id: 'CORE-DD250-001', name: 'Hilti Core Drill' },
                      { id: 'SAW-K770-001', name: 'Husqvarna Saw' },
                      { id: 'WALL-RS2-001', name: 'Pentruder Wall Saw' },
                      { id: 'POWER-ICS25-001', name: 'ICS Power Cutter' }
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => simulateQRScan(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.75rem',
                          backgroundColor: 'white',
                          color: 'rgb(29, 78, 216)',
                          borderRadius: '0.5rem',
                          fontSize: '0.875rem',
                          border: '1px solid rgb(191, 219, 254)',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgb(239, 246, 255)'
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <span style={{ fontWeight: '500' }}>{item.name}</span>
                        <ArrowRight style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Manual Input */}
            {!isScanning && (
              <form onSubmit={handleManualSearch} style={{ marginBottom: '1.5rem' }}>
                <div>
                  <label 
                    style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'rgb(55, 65, 81)',
                      marginBottom: '0.5rem'
                    }}
                  >
                    Asset ID or QR Code
                  </label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => setManualInput(e.target.value)}
                      placeholder="e.g., CORE-DD250-001"
                      style={{
                        flex: 1,
                        padding: '0.75rem',
                        border: '1px solid rgb(209, 213, 219)',
                        borderRadius: '0.375rem',
                        outline: 'none',
                        transition: 'all 0.2s'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = 'rgb(59, 130, 246)'
                        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgb(209, 213, 219)'
                        e.target.style.boxShadow = 'none'
                      }}
                      required
                    />
                    <button
                      type="submit"
                      disabled={loading}
                      style={{
                        backgroundColor: 'rgb(37, 99, 235)',
                        color: 'white',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.375rem',
                        border: 'none',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = 'rgb(29, 78, 216)'
                      }}
                      onMouseLeave={(e) => {
                        if (!loading) e.currentTarget.style.backgroundColor = 'rgb(37, 99, 235)'
                      }}
                    >
                      {loading ? (
                        <>
                          <Loader2 style={{ width: '1rem', height: '1rem', animation: 'spin 1s linear infinite' }} />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <Search style={{ width: '1rem', height: '1rem' }} />
                          <span>Search</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Asset ID Examples */}
                <div 
                  style={{
                    backgroundColor: 'rgb(249, 250, 251)',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    marginTop: '1rem'
                  }}
                >
                  <p style={{ fontSize: '0.875rem', color: 'rgb(75, 85, 99)', marginBottom: '0.5rem' }}>
                    Try these Asset IDs:
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {['CORE-DD250-001', 'SAW-K770-001', 'WALL-RS2-001', 'POWER-ICS25-001'].map(id => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setManualInput(id)}
                        style={{
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'white',
                          color: 'rgb(55, 65, 81)',
                          borderRadius: '0.25rem',
                          border: '1px solid rgb(209, 213, 219)',
                          fontSize: '0.875rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgb(249, 250, 251)'
                          e.currentTarget.style.transform = 'scale(1.05)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        {id}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}

            {/* Status Messages */}
            {error && (
              <div 
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgb(254, 242, 242)',
                  border: '1px solid rgb(252, 165, 165)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                }}
              >
                <AlertCircle style={{ height: '1.25rem', width: '1.25rem', color: 'rgb(239, 68, 68)' }} />
                <p style={{ color: 'rgb(185, 28, 28)', margin: 0 }}>{error}</p>
              </div>
            )}

            {success && (
              <div 
                style={{
                  marginBottom: '1rem',
                  padding: '1rem',
                  backgroundColor: 'rgb(240, 253, 244)',
                  border: '1px solid rgb(167, 243, 208)',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  animation: 'bounce 1s infinite'
                }}
              >
                <CheckCircle style={{ height: '1.25rem', width: '1.25rem', color: 'rgb(34, 197, 94)' }} />
                <p style={{ color: 'rgb(21, 128, 61)', margin: 0 }}>{success}</p>
              </div>
            )}

            {/* Speed Comparison */}
            <div 
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: 'linear-gradient(90deg, rgb(239, 246, 255), rgb(240, 253, 250))',
                borderRadius: '0.5rem',
                border: '1px solid rgb(191, 219, 254)'
              }}
            >
              <h4 style={{ fontWeight: '600', color: 'rgb(55, 65, 81)', marginBottom: '0.5rem', margin: '0 0 0.5rem 0' }}>
                ⚡ Pontifex Speed Advantage
              </h4>
              <div 
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                  fontSize: '0.875rem'
                }}
              >
                <div>
                  <p style={{ color: 'rgb(75, 85, 99)', margin: '0 0 0.25rem 0' }}>Hilti ON!Track:</p>
                  <p style={{ fontWeight: '600', color: 'rgb(220, 38, 38)', margin: '0 0 0.25rem 0' }}>~30 seconds per lookup</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', margin: 0 }}>Multiple screens, slow loading</p>
                </div>
                <div>
                  <p style={{ color: 'rgb(75, 85, 99)', margin: '0 0 0.25rem 0' }}>Pontifex Industries:</p>
                  <p style={{ fontWeight: '600', color: 'rgb(34, 197, 94)', margin: '0 0 0.25rem 0' }}>~3 seconds per lookup</p>
                  <p style={{ fontSize: '0.75rem', color: 'rgb(107, 114, 128)', margin: 0 }}>Instant scan, immediate results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add required CSS animations */}
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(-25%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
          50% { transform: none; animation-timing-function: cubic-bezier(0,0,0.2,1); }
        }
      `}</style>
    </>
  )
}