'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Bluetooth, Radar, Battery, MapPin, Link, Zap, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { bluetoothService, BeaconData, formatDistance, getSignalStrength, getDistanceColor } from '@/lib/bluetooth'
import { useToast } from '@/hooks/use-toast'

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
}

export default function BeaconScannerModal({ isOpen, onClose, onBeaconPaired }: BeaconScannerModalProps) {
  const [scanning, setScanning] = useState(false)
  const [detectedBeacons, setDetectedBeacons] = useState<BeaconData[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [selectedBeacon, setSelectedBeacon] = useState<BeaconData | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [pairingMode, setPairingMode] = useState(false)
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()

  // Check Bluetooth support on component mount
 useEffect(() => {
  checkBluetoothSupport()
  if (isOpen) {
    loadAvailableAssets()
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [isOpen])

  const checkBluetoothSupport = async () => {
    const supported = await bluetoothService.isBluetoothAvailable()
    setBluetoothSupported(supported)
    
    if (!supported) {
      setError('Web Bluetooth requires Chrome/Edge with HTTPS. Try accessing via https://localhost:3000')
    }
  }

  const loadAvailableAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, asset_id, status, assigned_location')
        .is('assigned_location', null) // Only show unassigned assets for pairing
        .order('name')

      if (error) throw error
      setAvailableAssets(data || [])
    } catch (error) {
      console.error('Error loading assets:', error)
      toast({
        title: "Error",
        description: "Failed to load available assets",
        variant: "destructive"
      })
    }
  }, [toast])

  // Handle beacon detection callback
  const handleBeaconDetection = useCallback((beacons: BeaconData[]) => {
    setDetectedBeacons(prev => {
      const updated = [...prev]
      
      beacons.forEach(newBeacon => {
        const existingIndex = updated.findIndex(b => b.id === newBeacon.id)
        if (existingIndex >= 0) {
          // Update existing beacon
          updated[existingIndex] = { ...updated[existingIndex], ...newBeacon, lastSeen: new Date() }
        } else {
          // Add new beacon
          updated.push(newBeacon)
        }
      })
      
      return updated
    })
  }, [])

  const startScanning = async () => {
    if (!bluetoothSupported) {
      setError('Bluetooth not supported in this browser/environment')
      return
    }

    setError('')
    setLoading(true)
    
    try {
      await bluetoothService.startScanning(handleBeaconDetection)
      setScanning(true)
      
      // Simulate beacon detection for demo (remove when M4P hardware arrives)
      simulateBeaconDetection()
      
      toast({
        title: "Scanning Started",
        description: "Searching for nearby M4P beacons...",
        variant: "default"
      })
    } catch (error) {
      console.error('Failed to start scanning:', error)
      setError(error instanceof Error ? error.message : 'Failed to start scanning')
    } finally {
      setLoading(false)
    }
  }

  const stopScanning = async () => {
    await bluetoothService.stopScanning()
    setScanning(false)
    toast({
      title: "Scanning Stopped",
      description: "Beacon scanning has been stopped",
      variant: "default"
    })
  }

  // Simulate beacon detection for demo purposes (remove when M4P hardware arrives)
  const simulateBeaconDetection = () => {
    const simulatedBeacons: BeaconData[] = [
      {
        id: 'M4P-001',
        name: 'M4P Beacon 001',
        rssi: -45,
        distance: 2.3,
        lastSeen: new Date(),
        batteryLevel: 85,
        isConnected: true
      },
      {
        id: 'M4P-002', 
        name: 'M4P Beacon 002',
        rssi: -65,
        distance: 8.7,
        lastSeen: new Date(),
        batteryLevel: 92,
        isConnected: true
      },
      {
        id: 'M4P-003',
        name: 'M4P Beacon 003', 
        rssi: -80,
        distance: 15.2,
        lastSeen: new Date(),
        batteryLevel: 67,
        isConnected: false
      }
    ]

    // Add simulated beacons gradually for demo effect
    simulatedBeacons.forEach((beacon, index) => {
      setTimeout(() => {
        setDetectedBeacons(prev => [...prev, beacon])
      }, (index + 1) * 1000)
    })
  }

  const handlePairBeacon = async () => {
    if (!selectedBeacon || !selectedAsset) {
      setError('Please select both a beacon and an asset')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Insert beacon pairing record
      const { error: beaconError } = await supabase
        .from('asset_beacons')
        .insert({
          asset_id: selectedAsset,
          beacon_id: selectedBeacon.id,
          beacon_name: selectedBeacon.name,
          battery_level: selectedBeacon.batteryLevel,
          last_seen: new Date().toISOString()
        })

      if (beaconError) throw beaconError

      // Update asset with beacon assignment
      const { error: assetError } = await supabase
        .from('assets')
        .update({
          assigned_location: `Beacon: ${selectedBeacon.name}`,
          last_updated: new Date().toISOString()
        })
        .eq('id', selectedAsset)

      if (assetError) throw assetError

      // Success!
      const assetName = availableAssets.find(a => a.id === selectedAsset)?.name
      toast({
        title: "Beacon Paired Successfully!",
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
    const strength = getSignalStrength(rssi)
    const baseClass = "w-4 h-4"
    
    switch (strength) {
      case 'excellent': return <div className={`${baseClass} bg-green-500 rounded-full`} />
      case 'good': return <div className={`${baseClass} bg-blue-500 rounded-full`} />
      case 'fair': return <div className={`${baseClass} bg-orange-500 rounded-full`} />
      case 'poor': return <div className={`${baseClass} bg-red-500 rounded-full`} />
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[95vh] overflow-y-auto">
        
        {/* Header - Mobile Optimized */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <Bluetooth className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">BLE Scanner</h2>
              <p className="text-blue-100 text-sm">MOKOSmart M4P</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Bluetooth Status & Controls - Mobile Stacked */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${bluetoothSupported ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="font-semibold text-sm">
                  {bluetoothSupported ? 'Bluetooth Ready' : 'Not Available'}
                </span>
              </div>
            </div>
            
            {/* Mobile-First Button Layout */}
            <div className="space-y-3">
              {!scanning ? (
                <button
                  onClick={startScanning}
                  disabled={!bluetoothSupported || loading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Radar className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Starting...' : 'Start Scanning'}</span>
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold"
                >
                  <div className="w-5 h-5 bg-white rounded-full animate-ping" />
                  <span>Stop Scanning</span>
                </button>
              )}
              
              <button
                onClick={() => setPairingMode(!pairingMode)}
                className={`w-full flex items-center justify-center space-x-2 px-6 py-4 rounded-xl transition-colors font-semibold ${
                  pairingMode 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Link className="w-5 h-5" />
                <span>{pairingMode ? 'Exit Pair Mode' : 'Enter Pair Mode'}</span>
              </button>
            </div>

            {error && (
              <div className="flex items-start space-x-2 text-red-600 bg-red-50 p-3 rounded-lg mt-4">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}
          </div>

          {/* Detected Beacons - Mobile Optimized */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
              <Radar className="w-5 h-5 text-blue-600" />
              <span>Detected ({detectedBeacons.length})</span>
            </h3>
            
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {detectedBeacons.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  {scanning ? (
                    <div className="flex flex-col items-center space-y-3">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                      <p className="text-sm">Scanning for beacons...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-3">
                      <Bluetooth className="w-8 h-8 text-gray-400" />
                      <p className="text-sm">No beacons detected</p>
                      <p className="text-xs text-gray-400">Start scanning to begin</p>
                    </div>
                  )}
                </div>
              ) : (
                detectedBeacons.map((beacon) => (
                  <div
                    key={beacon.id}
                    onClick={() => pairingMode && setSelectedBeacon(beacon)}
                    className={`p-4 border rounded-xl transition-all cursor-pointer ${
                      selectedBeacon?.id === beacon.id && pairingMode
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Bluetooth className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{beacon.name}</h4>
                          <p className="text-xs text-gray-600">{beacon.id}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {getSignalIcon(beacon.rssi)}
                        {beacon.isConnected ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500">Distance</p>
                        <p className={`font-medium ${getDistanceColor(beacon.distance)}`}>
                          {formatDistance(beacon.distance)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Signal</p>
                        <p className="font-medium">{beacon.rssi} dBm</p>
                      </div>
                      
                      <div>
                        <p className="text-gray-500">Battery</p>
                        <div className="flex items-center space-x-1">
                          <Battery className={`w-3 h-3 ${getBatteryColor(beacon.batteryLevel)}`} />
                          <span className="font-medium text-xs">{beacon.batteryLevel || '?'}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Asset Pairing - Mobile Optimized */}
          {pairingMode && (
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <span>Pair with Asset</span>
              </h3>
              
              <div className="space-y-4">
                {selectedBeacon && (
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Selected Beacon</h4>
                    <p className="text-blue-700 text-sm">{selectedBeacon.name}</p>
                    <p className="text-xs text-blue-600">{selectedBeacon.id}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Asset to Pair
                  </label>
                  <select
                    value={selectedAsset}
                    onChange={(e) => setSelectedAsset(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    <option value="">Choose an asset...</option>
                    {availableAssets.map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} (#{asset.asset_id})
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={handlePairBeacon}
                  disabled={!selectedBeacon || !selectedAsset || loading}
                  className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Link className="w-5 h-5" />
                  )}
                  <span>{loading ? 'Pairing...' : 'Pair Beacon with Asset'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Competitive Advantage Display - Mobile Optimized */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl border border-green-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span>Hilti ON!Track Advantages</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Metal Performance:</span>
                <span className="font-semibold text-green-600">✅ 70% better</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Real-time Tracking:</span>
                <span className="font-semibold text-blue-600">Live updates</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cost per Tag:</span>
                <span className="font-semibold text-orange-600">70% cheaper</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}