'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Bluetooth, Radar, Battery, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { bluetoothService } from '@/lib/bluetooth'
import { gatewayService } from '@/lib/gateway'
import { useToast } from '@/hooks/use-toast'

// Local BeaconData interface to avoid import issues
interface BeaconData {
  id: string
  name: string
  distance: number
  rssi: number
  battery?: number
  lastSeen: Date
  manufacturer?: string
  txPower?: number
  source?: string // Track whether beacon came from 'bluetooth' or 'gateway'
}

// FIXED: Local GatewayBeaconData interface since it's not exported
interface GatewayBeaconData {
  mac: string
  name?: string
  distance?: number
  rssi: number
  battery?: number
  lastSeen: Date
  manufacturer?: string
}

interface BeaconScannerModalProps {
  isOpen: boolean
  onClose: () => void
  onBeaconPaired?: (beaconId: string, assetId: string) => void
}

interface Asset {
  id: string
  name: string
  asset_id: string
  status: string
  assigned_location?: string
  beacon_id?: string // ADDED: Track beacon assignments
}

export default function BeaconScannerModal({ isOpen, onClose, onBeaconPaired }: BeaconScannerModalProps) {
  const [scanning, setScanning] = useState(false)
  const [detectedBeacons, setDetectedBeacons] = useState<BeaconData[]>([])
  const [allAssets, setAllAssets] = useState<Asset[]>([]) // CHANGED: from availableAssets to allAssets
  const [assetsLoading, setAssetsLoading] = useState(false) // ADDED: Loading state for assets
  const [selectedBeacon, setSelectedBeacon] = useState<BeaconData | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [assetSearch, setAssetSearch] = useState<string>('') // ADDED: Asset search state
  const [pairingMode, setPairingMode] = useState(false)
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Gateway state
  const [gatewayConnected, setGatewayConnected] = useState(false)
  const [gatewayIP, setGatewayIP] = useState('192.168.1.1')
  const [gatewayTesting, setGatewayTesting] = useState(false)
  
  const { toast } = useToast()

  // FIXED: Enhanced beacon selection handler with proper state management
  const handleBeaconSelection = useCallback((beacon: BeaconData) => {
    console.log('🎯 handleBeaconSelection called with:', beacon.name, beacon.id)
    console.log('🔍 Current selectedBeacon before update:', selectedBeacon?.name || 'none')
    
    // Use functional update to ensure we get the latest state
    setSelectedBeacon(prevSelected => {
      console.log('📝 Setting beacon from', prevSelected?.name || 'none', 'to', beacon.name)
      return beacon
    })
    
    // Log the selection attempt
    console.log('✅ setSelectedBeacon called successfully')
    
    // Check state after a brief delay
    setTimeout(() => {
      console.log('🔍 State check after 100ms - this should show the old state due to closure')
    }, 100)
  }, [selectedBeacon]) // Include selectedBeacon in dependencies

  // ADDED: Monitor selectedBeacon state changes
  useEffect(() => {
    console.log('🔄 selectedBeacon state changed to:', selectedBeacon?.name || 'null')
    console.log('🔄 Pair button should be:', (!selectedBeacon || !selectedAsset || loading) ? 'DISABLED' : 'ENABLED')
    
    if (selectedBeacon) {
      console.log('✅ Beacon successfully selected:', {
        name: selectedBeacon.name,
        id: selectedBeacon.id,
        battery: selectedBeacon.battery,
        rssi: selectedBeacon.rssi
      })
    }
  }, [selectedBeacon, selectedAsset, loading])

  // Check Bluetooth support on component mount
  useEffect(() => {
    let isMounted = true
    
    const checkBluetoothSupport = async () => {
      const supported = await bluetoothService.isBluetoothAvailable()
      setBluetoothSupported(supported)
      
      if (!supported) {
        setError('Web Bluetooth API not supported. Please use Chrome/Edge on desktop or enable experimental features.')
      }
    }

    // FIXED: Load ALL assets like Dashboard does (not just available ones)
    const loadAllAssets = async () => {
      if (!isMounted) return
      
      try {
        setAssetsLoading(true)
        console.log('🔄 Loading assets for beacon pairing...')
        
        const { data: assets, error } = await supabase
          .from('assets')
          .select('id, name, asset_id, status, assigned_location, beacon_id')
          .order('name')
          .limit(100)

        if (!isMounted) return // Component unmounted, don't update state

        console.log('📊 Raw Supabase response:', { assets, error })

        if (error) {
          console.error('❌ Supabase error:', error)
          throw error
        }
        
        const assetArray = assets || []
        setAllAssets(assetArray)
        console.log(`✅ Successfully loaded ${assetArray.length} assets:`, assetArray.slice(0, 3))
        
      } catch (error) {
        if (!isMounted) return
        
        // FIXED: Proper error typing
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error('❌ Failed to load assets:', errorMessage)
        toast({
          title: "Error Loading Assets",
          description: `Failed to load assets: ${errorMessage}`, 
          variant: "destructive"
        })
        setAllAssets([])
        
        // Try a simple fallback query
        try {
          console.log('🔄 Trying fallback query...')
          const { data: fallbackAssets } = await supabase.from('assets').select('id, name, asset_id, status').limit(20)
          if (isMounted && fallbackAssets && fallbackAssets.length > 0) {
            setAllAssets(fallbackAssets)
            console.log(`✅ Fallback successful: ${fallbackAssets.length} assets`)
          }
        } catch (fallbackError) {
          console.error('❌ Fallback also failed:', fallbackError)
        }
      } finally {
        if (isMounted) {
          setAssetsLoading(false)
          console.log('🏁 Asset loading complete')
        }
      }
    }

    // FIXED: Simplified gateway connection check (removed autoDiscover)
    const checkGatewayConnection = async () => {
      try {
        // Simple connection test instead of autoDiscover
        console.log('🔍 Checking gateway connection...')
        setGatewayConnected(false) // Default to false until proper test
      } catch (error) {
        console.log('Gateway check failed:', error)
        setGatewayConnected(false)
      }
    }

    // Run initialization
    checkBluetoothSupport()
    
    if (isOpen) {
      console.log('🚀 Modal opened, loading assets...')
      loadAllAssets()
      checkGatewayConnection()
    }
    
    return () => {
      isMounted = false
    }
  }, [isOpen, toast])

  // FIXED: Test gateway connection (simplified without testConnection method)
  const testGatewayConnection = async () => {
    setGatewayTesting(true)
    try {
      console.log(`🧪 Testing MKGW3 connection to ${gatewayIP}...`)
      
      // FIXED: Simplified connection test with proper timeout using AbortController
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const connected = await fetch(`http://${gatewayIP}/health`, { 
        method: 'GET',
        signal: controller.signal
      }).then(() => {
        clearTimeout(timeoutId)
        return true
      }).catch(() => {
        clearTimeout(timeoutId)
        return false
      })
      
      setGatewayConnected(connected)
      
      if (connected) {
        toast({
          title: "Gateway Connected! 🌐",
          description: `MKGW3 at ${gatewayIP} is ready for extended range scanning`,
          variant: "default"
        })
      } else {
        toast({
          title: "Connection Failed",
          description: "Could not connect to MKGW3 gateway. Check IP address and network.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Gateway test failed:', error)
      setGatewayConnected(false)
      toast({
        title: "Gateway Error",
        description: "Failed to connect to gateway",
        variant: "destructive"
      })
    } finally {
      setGatewayTesting(false)
    }
  }

  // Enhanced scanning with dual detection
  const startScanning = async () => {
    if (!bluetoothSupported) return
    
    setLoading(true)
    setError('')
    setDetectedBeacons([]) // Clear previous results
    
    try {
      console.log('🔍 Starting enhanced beacon scanning...')
      
      // Start Web Bluetooth scanning (close range, direct detection)
      await bluetoothService.startScanning((beacons: BeaconData[]) => {
        console.log(`📱 Web Bluetooth detected ${beacons.length} beacons`)
        setDetectedBeacons(prevBeacons => {
          const updatedBeacons = beacons.map(beacon => ({ 
            ...beacon, 
            lastSeen: new Date(),
            source: 'bluetooth' // Track source
          }))
          
          // Merge with existing beacons, avoiding duplicates
          const merged = [...prevBeacons]
          updatedBeacons.forEach(newBeacon => {
            const existingIndex = merged.findIndex(b => b.id === newBeacon.id)
            if (existingIndex >= 0) {
              merged[existingIndex] = newBeacon // Update existing
            } else {
              merged.push(newBeacon) // Add new
            }
          })
          
          return merged
        })
      })
      
      // FIXED: Use correct method name 'startMonitoring' instead of 'startGatewayMonitoring'
      if (gatewayConnected) {
        console.log('🌐 Starting MKGW3 gateway monitoring...')
        await gatewayService.startMonitoring((beacons: BeaconData[]) => {
          console.log(`📡 Gateway detected ${beacons.length} beacons`)
          
          // Convert gateway beacons to BeaconData format (if needed)
          // Assume the gateway service already provides BeaconData format
          const convertedBeacons: BeaconData[] = beacons.map(beacon => ({
            id: beacon.id,
            name: beacon.name || `M4P-${beacon.id.substring(8)}`,
            distance: beacon.distance || 0,
            rssi: beacon.rssi,
            battery: beacon.battery,
            lastSeen: beacon.lastSeen,
            manufacturer: beacon.manufacturer || 'MOKOSmart',
            source: 'gateway' // Track source
          }))
          
          // Merge gateway beacons with existing ones
          setDetectedBeacons(prevBeacons => {
            const merged = [...prevBeacons]
            convertedBeacons.forEach(newBeacon => {
              const existingIndex = merged.findIndex(b => b.id === newBeacon.id)
              if (existingIndex >= 0) {
                // Prefer closer/stronger signal (higher RSSI)
                if (newBeacon.rssi > merged[existingIndex].rssi) {
                  merged[existingIndex] = newBeacon
                }
              } else {
                merged.push(newBeacon) // Add new beacon
              }
            })
            return merged
          })
        })
      }
      
      setScanning(true)
      const modeDescription = gatewayConnected 
        ? 'Dual-mode detection: Web Bluetooth + MKGW3 Gateway' 
        : 'Web Bluetooth scanning only'
        
      toast({
        title: "Enhanced Scanning Started! 🚀",
        description: modeDescription,
        variant: "default"
      })
      
    } catch (error) {
      console.error('Scanning error:', error)
      setError('Enhanced scanning failed. Trying fallback mode...')
      
      // Fallback: Try simple Bluetooth scanning only
      try {
        await bluetoothService.startScanning((beacons: BeaconData[]) => {
          setDetectedBeacons(beacons.map(beacon => ({ ...beacon, lastSeen: new Date() })))
        })
        setScanning(true)
        setError('') // Clear error if fallback works
      } catch (fallbackError) {
        console.error('Fallback scanning also failed:', fallbackError)
        setError('All scanning methods failed. Please check your setup.')
      }
    } finally {
      setLoading(false)
    }
  }

  const stopScanning = async () => {
    await bluetoothService.stopScanning()
    
    // FIXED: Use correct method name 'stopMonitoring' instead of 'stopGatewayMonitoring'
    if (gatewayConnected) {
      gatewayService.stopMonitoring()
    }
    
    setScanning(false)
    toast({
      title: "Scanning Stopped",
      description: "Beacon detection has been paused",
      variant: "default"
    })
  }

  const handleStopScanning = stopScanning

  // ENHANCED: Beacon pairing with database storage
  const pairBeaconWithAsset = async () => {
    if (!selectedBeacon || !selectedAsset) {
      setError('Please select both a beacon and an asset to pair.')
      return
    }

    setLoading(true)
    try {
      // Create beacon pairing record in database
      const { error: pairingError } = await supabase
        .from('asset_beacons')
        .upsert({
          asset_id: selectedAsset,
          beacon_id: selectedBeacon.id,
          beacon_name: selectedBeacon.name,
          battery_level: selectedBeacon.battery,
          last_seen: new Date().toISOString(),
          is_active: true
        })

      if (pairingError) {
        console.warn('Asset beacons table might not exist yet, continuing with asset update only')
      }

      // Update asset record with beacon assignment
      const { error: assetError } = await supabase
        .from('assets')
        .update({
          beacon_id: selectedBeacon.id,
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedAsset)

      if (assetError) throw assetError
      
      const assetName = allAssets.find(a => a.id === selectedAsset)?.name || 'Unknown Asset'
      
      toast({
        title: "Beacon Paired Successfully! ✅",
        description: `${selectedBeacon.name} is now tracking ${assetName}`,
        variant: "default"
      })

      // Callback to parent component
      if (onBeaconPaired) {
        onBeaconPaired(selectedBeacon.id, selectedAsset)
      }

      // Reset pairing mode
      setPairingMode(false)
      setSelectedBeacon(null)
      setSelectedAsset('')
      setAssetSearch('') // ADDED: Clear search when pairing completes
      
      // Refresh asset list to show the new pairing
      const { data: refreshedAssets } = await supabase
        .from('assets')
        .select('id, name, asset_id, status, assigned_location, beacon_id')
        .order('name')
        .limit(100)
      
      if (refreshedAssets) {
        setAllAssets(refreshedAssets)
      }
      
    } catch (error) {
      console.error('Pairing error:', error)
      setError('Failed to pair beacon with asset. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getBatteryColor = (level?: number) => {
    if (!level) return 'text-gray-400'
    if (level > 50) return 'text-green-500'
    if (level > 20) return 'text-orange-500'
    return 'text-red-500'
  }

  const getSignalIcon = (rssi: number) => {
    const baseClass = "w-4 h-4"
    
    if (rssi > -50) return <div className={`${baseClass} bg-green-500 rounded-full`} />
    if (rssi > -70) return <div className={`${baseClass} bg-blue-500 rounded-full`} />
    if (rssi > -85) return <div className={`${baseClass} bg-orange-500 rounded-full`} />
    return <div className={`${baseClass} bg-red-500 rounded-full`} />
  }

  const formatDistance = (distance: number) => {
    if (distance < 1) return `${(distance * 100).toFixed(0)}cm`
    return `${distance.toFixed(1)}m`
  }

  const getDistanceColor = (distance: number) => {
    if (distance < 2) return 'text-green-600'
    if (distance < 10) return 'text-blue-600'
    if (distance < 20) return 'text-orange-600'
    return 'text-red-600'
  }

  const getSourceIcon = (source?: string) => {
    return source === 'gateway' ? '🌐' : '📱'
  }

  // ADDED: Helper function to display asset pairing status
  const getAssetDisplayInfo = (asset: Asset) => {
    const isPaired = !!asset.beacon_id
    const statusText = isPaired ? '📡 Beacon Paired' : asset.status
    const statusColor = isPaired ? 'text-blue-600' : 
      asset.status === 'available' ? 'text-green-600' :
      asset.status === 'in_use' ? 'text-yellow-600' :
      asset.status === 'maintenance' ? 'text-red-600' : 'text-gray-600'
    
    return { statusText, statusColor, isPaired }
  }

  // ADDED: Filter assets based on search term
  const filteredAssets = allAssets.filter(asset => {
    if (!assetSearch) return true
    const searchLower = assetSearch.toLowerCase()
    return (
      asset.name?.toLowerCase().includes(searchLower) ||
      asset.asset_id?.toLowerCase().includes(searchLower) ||
      asset.status?.toLowerCase().includes(searchLower)
    )
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="max-w-sm sm:max-w-4xl lg:max-w-6xl w-full h-[95vh] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-0 shadow-2xl rounded-lg flex flex-col overflow-hidden">
        
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-3 sm:px-6 py-3 sm:py-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                <Bluetooth className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm sm:text-xl lg:text-2xl font-bold text-white">
                  <span className="block sm:hidden">Beacon Scanner</span>
                  <span className="hidden sm:block">Enhanced Beacon Scanner</span>
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm lg:text-base">
                  <span className="block sm:hidden">Bluetooth + Gateway</span>
                  <span className="hidden sm:block">Dual-detection: Bluetooth + MKGW3 Gateway</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors flex-shrink-0 p-2 touch-manipulation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 pb-3 sm:pb-6 min-h-0">

          {/* Connection Status Cards - Simplified for Mobile */}
          <div className="grid grid-cols-3 gap-2 mb-3 sm:mb-4 mt-3 sm:mt-4">
            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-2 sm:p-3 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className={`w-2 h-2 rounded-full mb-1 ${bluetoothSupported ? 'bg-green-500' : 'bg-red-500'}`} />
                <h3 className="font-medium text-xs">Bluetooth</h3>
                <p className="text-xs text-gray-500">{bluetoothSupported ? 'Ready' : 'N/A'}</p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-2 sm:p-3 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className={`w-2 h-2 rounded-full mb-1 ${gatewayConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <h3 className="font-medium text-xs">Gateway</h3>
                <p className="text-xs text-gray-500">{gatewayConnected ? 'Online' : 'Offline'}</p>
              </div>
            </div>

            <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-2 sm:p-3 rounded-lg">
              <div className="flex flex-col items-center text-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mb-1" />
                <h3 className="font-medium text-xs">Beacons</h3>
                <p className="text-xs text-gray-500">{detectedBeacons.length} Found</p>
              </div>
            </div>
          </div>

          {/* Gateway Configuration - Hidden on Mobile, Expandable */}
          <div className="hidden sm:block bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 mb-3 sm:mb-4 p-2 sm:p-3 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Radar className="w-4 h-4 text-purple-600" />
                <span>Gateway (IP: {gatewayIP})</span>
              </h3>
              <button 
                onClick={testGatewayConnection}
                disabled={gatewayTesting}
                className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors text-xs font-medium disabled:opacity-50 flex items-center gap-1"
              >
                {gatewayTesting && <Loader2 className="w-3 h-3 animate-spin" />}
                {gatewayTesting ? 'Testing...' : 'Test'}
              </button>
            </div>
          </div>

          {/* Enhanced Scanning Controls */}
          <div className="mb-3 sm:mb-4">
            {!scanning ? (
              <button
                onClick={startScanning}
                disabled={loading || !bluetoothSupported}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl p-3 sm:p-4 flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm sm:text-lg font-semibold">Starting...</span>
                  </>
                ) : (
                  <>
                    <Radar className="w-5 h-5" />
                    <span className="text-sm sm:text-lg font-semibold">Start Scanning</span>
                    <span className="hidden sm:inline bg-white/20 px-2 py-1 rounded-full text-xs">
                      {gatewayConnected ? '100m+' : 'Bluetooth'}
                    </span>
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleStopScanning}  
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl p-3 sm:p-4 flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg touch-manipulation"
              >
                <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                <span className="text-sm sm:text-lg font-semibold">Stop Scanning</span>
                <span className="hidden sm:inline bg-white/20 px-2 py-1 rounded-full text-xs animate-pulse">
                  {gatewayConnected ? 'Dual-Mode' : 'Active'}
                </span>
              </button>
            )}
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mb-3 border border-red-200 dark:border-red-800">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{error}</span>
            </div>
          )}

          <div className="space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0">
            
            {/* Detected Beacons */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center space-x-2">
                <Radar className="w-4 h-4 text-blue-600" />
                <span>Found Beacons ({detectedBeacons.length})</span>
              </h3>
              
              <div className="space-y-2 max-h-60 sm:max-h-80 overflow-y-auto">
                {detectedBeacons.length === 0 ? (
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-4 sm:p-6 text-center text-gray-500 rounded-lg">
                    {scanning ? (
                      <div className="flex flex-col items-center space-y-2">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        <p className="font-medium text-sm">Scanning...</p>
                        <p className="text-xs">Power on M4P beacons</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center space-y-2">
                        <Bluetooth className="w-6 h-6 text-gray-400" />
                        <p className="font-medium text-sm">No beacons detected</p>
                        <p className="text-xs">Start scanning to find beacons</p>
                      </div>
                    )}
                  </div>
                ) : (
                  detectedBeacons.map((beacon) => (
                    <div
                      key={`beacon-${beacon.id}-${selectedBeacon?.id || 'none'}`}
                      className={`bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border transition-all p-3 rounded-lg ${
                        selectedBeacon?.id === beacon.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg ring-2 ring-blue-500/20'
                          : 'border-white/20 hover:border-blue-300'
                      }`}
                    >
                      {/* FIXED: Use a button instead of div onClick for better event handling */}
                      <button
                        onClick={(e) => {
                          console.log('🚨 BEACON BUTTON CLICKED!', beacon.name, beacon.id)
                          e.preventDefault()
                          e.stopPropagation()
                          handleBeaconSelection(beacon)
                        }}
                        className="w-full text-left cursor-pointer hover:bg-blue-50/50 -m-3 p-3 rounded-lg transition-colors"
                        style={{ 
                          background: 'transparent',
                          border: 'none',
                          outline: 'none'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Bluetooth className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm flex items-center gap-1">
                              <span className="truncate">{beacon.name}</span>
                              <span className="text-xs">{getSourceIcon(beacon.source)}</span>
                            </h4>
                            <p className="text-xs text-gray-600 truncate">{beacon.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          {getSignalIcon(beacon.rssi)}
                          {selectedBeacon?.id === beacon.id ? (
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                          ) : (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-500 mb-1">Distance</p>
                          <p className={`font-medium ${getDistanceColor(beacon.distance)}`}>
                            {formatDistance(beacon.distance)}
                          </p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-gray-500 mb-1">Signal</p>
                          <p className="font-medium">{beacon.rssi} dBm</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-gray-500 mb-1">Battery</p>
                          <div className="flex items-center justify-center space-x-1">
                            <Battery className={`w-3 h-3 ${getBatteryColor(beacon.battery)}`} />
                            <span className="font-medium">{beacon.battery || '?'}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500 flex justify-between">
                        <span>{beacon.lastSeen.toLocaleTimeString()}</span>
                        <span>{beacon.source === 'gateway' ? '🌐' : '📱'}</span>
                      </div>
                      
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Asset Pairing - STREAMLINED UX */}
            <div>
              <h3 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span>Select Asset ({allAssets.length} available)</span>
                {assetsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
              </h3>
              
              {assetsLoading ? (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-4 sm:p-6 text-center rounded-lg">
                  <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-3 animate-spin" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    Loading assets from database...
                  </p>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        console.log('🛑 Force stop loading')
                        setAssetsLoading(false)
                      }}
                      className="text-xs text-red-600 hover:text-red-800 underline block mx-auto"
                    >
                      Stop Loading
                    </button>
                    <button
                      onClick={async () => {
                        console.log('🔧 Testing Supabase connection...')
                        try {
                          const { data, error, count } = await supabase
                            .from('assets')
                            .select('*', { count: 'exact' })
                            .limit(3)
                          console.log('Supabase test result:', { data, error, count })
                          if (data) {
                            setAllAssets(data)
                            setAssetsLoading(false)
                            toast({
                              title: "Debug Success!",
                              description: `Found ${data.length} assets`,
                            })
                          }
                        } catch (err) {
                          console.error('Supabase test error:', err)
                        }
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline block mx-auto"
                    >
                      Test Database Connection
                    </button>
                  </div>
                </div>
              ) : allAssets.length === 0 ? (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-4 sm:p-6 text-center rounded-lg">
                  <AlertCircle className="w-8 h-8 text-yellow-500 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    No assets found in database
                  </p>
                  <button
                    onClick={() => {
                      // Retry loading assets
                      const retryLoad = async () => {
                        setAssetsLoading(true)
                        try {
                          const { data, error } = await supabase.from('assets').select('id, name, asset_id, status')
                          if (error) throw error
                          setAllAssets(data || [])
                          console.log('Retry successful:', data?.length)
                        } catch (err) {
                          console.error('Retry failed:', err)
                        } finally {
                          setAssetsLoading(false)
                        }
                      }
                      retryLoad()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    🔄 Retry Loading
                  </button>
                </div>
              ) : pairingMode ? (
                <div className="space-y-3">
                  {/* MERGED: Search + Select in One Step */}
                  <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-3 rounded-lg">
                    
                    {/* Search Input */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="🔍 Search assets... (try hilti, drill, core)"
                        value={assetSearch}
                        onChange={(e) => {
                          setAssetSearch(e.target.value)
                          // Clear selected asset when searching
                          if (e.target.value && selectedAsset) {
                            const stillVisible = filteredAssets.some(a => a.id === selectedAsset)
                            if (!stillVisible) setSelectedAsset('')
                          }
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm touch-manipulation"
                      />
                      {assetSearch && (
                        <p className="text-xs text-blue-600 mt-1">
                          ✨ {filteredAssets.length} assets found for &quot;{assetSearch}&quot;
                        </p>
                      )}
                    </div>
                    
                    {/* DIRECT CLICK ASSETS (No Dropdown!) */}
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                      {allAssets.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {assetsLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Loading assets...</span>
                            </div>
                          ) : (
                            <div>
                              <p className="mb-2">No assets found in database</p>
                              <button
                                onClick={() => {
                                  const quickLoad = async () => {
                                    const { data } = await supabase.from('assets').select('*').limit(10)
                                    if (data) setAllAssets(data)
                                  }
                                  quickLoad()
                                }}
                                className="text-xs text-blue-600 underline"
                              >
                                Try Quick Reload
                              </button>
                            </div>
                          )}
                        </div>
                      ) : filteredAssets.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          {assetSearch ? `No assets found for "${assetSearch}"` : 'No assets match current search'}
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {filteredAssets.slice(0, 10).map((asset) => {
                            const { statusText, isPaired } = getAssetDisplayInfo(asset)
                            const isSelected = selectedAsset === asset.id
                            return (
                              <div
                                key={asset.id}
                                onClick={() => {
                                  setSelectedAsset(asset.id)
                                  console.log('🎯 Asset selected:', asset.name, asset.id)
                                  console.log('🔍 Current state:', { 
                                    selectedBeacon: selectedBeacon?.name, 
                                    selectedAsset: asset.id,
                                    loading 
                                  })
                                }}
                                className={`p-3 hover:bg-blue-50 cursor-pointer transition-colors touch-manipulation ${
                                  isSelected ? 'bg-blue-100 border-l-4 border-blue-500' : ''
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                      {asset.name}
                                    </h4>
                                    <p className="text-xs text-gray-600">
                                      #{asset.asset_id} • {statusText} {isPaired ? '📡' : ''}
                                    </p>
                                  </div>
                                  {isSelected && (
                                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {(filteredAssets.length > 10) && (
                            <div className="p-2 text-center text-xs text-gray-500 bg-gray-50">
                              + {filteredAssets.length - 10} more assets (refine search to see all)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Selected Pairing Preview */}
                    {selectedBeacon && selectedAsset && (
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg mt-3 border border-green-200">
                        <p className="text-sm text-green-800 dark:text-green-200">
                          <strong>Ready to pair:</strong> {selectedBeacon.name} {'->'} {allAssets.find(a => a.id === selectedAsset)?.name}
                        </p>
                      </div>
                    )}
                    
                    {/* Debug Info with working manual test button */}
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      <div>Beacon: {selectedBeacon ? `✅ ${selectedBeacon.name} (ID: ${selectedBeacon.id})` : '❌ None selected'}</div>
                      <div>Asset: {selectedAsset ? `✅ ${allAssets.find(a => a.id === selectedAsset)?.name || selectedAsset}` : '❌ None selected'}</div>
                      <div>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
                      <div>Pairing Mode: {pairingMode ? '✅ Active' : '❌ Inactive'}</div>
                      <div>Button: {(!selectedBeacon || !selectedAsset || loading) ? '🔒 Disabled' : '✅ Ready'}</div>
                      <div className="text-blue-600">Debug: Beacon count = {detectedBeacons.length}, Asset count = {allAssets.length}</div>
                      {selectedBeacon && (
                        <div className="text-green-600">Selected Beacon Details: {selectedBeacon.name}, RSSI: {selectedBeacon.rssi}, Battery: {selectedBeacon.battery}%</div>
                      )}
                      {/* WORKING MANUAL TEST BUTTON - Same as before that worked! */}
                      {detectedBeacons.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-200">
                          <button
                            onClick={() => {
                              console.log('🧪 MANUAL TEST: Selecting first beacon directly')
                              const firstBeacon = detectedBeacons[0]
                              console.log('🧪 First beacon:', firstBeacon)
                              handleBeaconSelection(firstBeacon)
                            }}
                            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 mr-2"
                          >
                            🧪 Manual Test: Select First Beacon
                          </button>
                          <button
                            onClick={() => {
                              console.log('🧪 MANUAL CLEAR: Clearing beacon selection')
                              setSelectedBeacon(null)
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            🧪 Clear Selection
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <button
                        onClick={() => {
                          console.log('🔗 Pair button clicked!')
                          console.log('State check:', { 
                            selectedBeacon: selectedBeacon?.name, 
                            selectedAsset: allAssets.find(a => a.id === selectedAsset)?.name,
                            loading 
                          })
                          pairBeaconWithAsset()
                        }}
                        disabled={!selectedBeacon || !selectedAsset || loading}
                        className={`flex-1 rounded-lg py-3 px-4 font-medium transition-all duration-300 text-sm touch-manipulation ${
                          (!selectedBeacon || !selectedAsset || loading)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white'
                        }`}
                      >
                        {loading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Pairing...</span>
                          </div>
                        ) : (
                          '🔗 Pair Selected Asset'
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setPairingMode(false)
                          setAssetSearch('')
                          setSelectedAsset('')
                          setSelectedBeacon(null)
                          console.log('❌ Pairing cancelled')
                        }}
                        className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm touch-manipulation"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border border-white/20 p-4 sm:p-6 text-center rounded-lg">
                  <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                    Select a beacon above, then choose an asset to pair
                  </p>
                  <button
                    onClick={() => setPairingMode(true)}
                    disabled={detectedBeacons.length === 0 || assetsLoading}
                    className="px-4 sm:px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm touch-manipulation"
                  >
                    🚀 Start Pairing
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}