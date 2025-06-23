// src/lib/bluetooth.ts - UPDATED WITH MISSING FUNCTIONS

export interface BeaconData {
  id: string
  name: string
  distance: number
  rssi: number
  batteryLevel?: number
  lastSeen: Date
  manufacturer?: string
  txPower?: number
  temperature?: number
  humidity?: number
  isConnected?: boolean
}

export interface AssetLocation {
  beaconId: string
  location: string
  timestamp: Date
  confidence: number // 0-100 based on signal strength
}

class BluetoothService {
  private scanning = false
  private devices = new Map<string, BluetoothDevice>()
  private scanCallback: (beacons: BeaconData[]) => void = () => {}

  // Initialize Web Bluetooth API
  async isBluetoothAvailable(): Promise<boolean> {
    try {
      if (!navigator.bluetooth) {
        console.warn('Web Bluetooth API not supported')
        return false
      }
      
      const available = await navigator.bluetooth.getAvailability()
      return available
    } catch (error) {
      console.error('Bluetooth availability check failed:', error)
      return false
    }
  }

  // Start scanning for beacons
  async startScanning(callback: (beacons: BeaconData[]) => void): Promise<void> {
    if (this.scanning) return

    try {
      // Request device with filters for our beacons
      const device = await navigator.bluetooth!.requestDevice({
        filters: [
          { namePrefix: "M4P" },
          { namePrefix: "PONTIFEX" },
        ],
        optionalServices: [
          'battery_service',
          'device_information',
          'environmental_sensing'
        ]
      })

      console.log('✅ Bluetooth scanning started')
      this.scanning = true
      this.scanCallback = callback

      // Connect to the found device
      await this.connectToDevice(device)
    } catch (error) {
      console.error('❌ Failed to start scanning:', error)
      throw new Error('Bluetooth scanning failed. Please ensure Bluetooth is enabled.')
    }
  }

  // Connect to individual beacon
  private async connectToDevice(device: BluetoothDevice): Promise<void> {
    try {
      const server = await device.gatt?.connect()
      if (!server) throw new Error('Failed to connect to GATT server')

      this.devices.set(device.id, device)

      // Get device information
      const beaconData: BeaconData = {
        id: device.id,
        name: device.name || 'Unknown',
        distance: this.calculateDistance(-65), // Simulated RSSI
        rssi: -65,
        batteryLevel: await this.getBatteryLevel(server),
        lastSeen: new Date(),
        manufacturer: 'MOKOSmart',
        txPower: -4,
        isConnected: true
      }

      // Notify callback with updated beacon data
      this.scanCallback([beaconData])
    } catch (error) {
      console.error('Connection error:', error)
    }
  }

  // Get battery level from device
  private async getBatteryLevel(server: BluetoothRemoteGATTServer): Promise<number> {
    try {
      const service = await server.getPrimaryService('battery_service')
      const characteristic = await service.getCharacteristic('battery_level')
      const value = await characteristic.readValue()
      return value.getUint8(0)
    } catch {
      console.log('Battery service not available')
      return 85 // Default battery level
    }
  }

  // Calculate distance from RSSI (simplified)
  private calculateDistance(rssi: number): number {
    // Simplified distance calculation for M4P beacons
    // Real implementation would use beacon-specific calibration
    const txPower = -4 // M4P typical TX power
    if (rssi === 0) return -1.0
    
    const ratio = rssi * 1.0 / txPower
    if (ratio < 1.0) {
      return Math.pow(ratio, 10)
    } else {
      const accuracy = (0.89976) * Math.pow(ratio, 7.7095) + 0.111
      return accuracy
    }
  }

  // Stop scanning
  stopScanning(): void {
    this.scanning = false
    this.scanCallback = () => {}
    console.log('🛑 Bluetooth scanning stopped')
  }

  // Pair beacon with asset
  async pairBeaconWithAsset(beaconId: string, assetId: string): Promise<boolean> {
    try {
      // This would integrate with your Supabase database
      console.log(`Pairing beacon ${beaconId} with asset ${assetId}`)
      return true
    } catch (error) {
      console.error('Pairing failed:', error)
      return false
    }
  }

  // Get simulated beacons for demo (while awaiting M4P hardware)
  getSimulatedBeacons(): BeaconData[] {
    return [
      {
        id: 'M4P-001',
        name: 'M4P Beacon 001',
        distance: 2.1,
        rssi: -55,
        batteryLevel: 95,
        lastSeen: new Date(),
        manufacturer: 'MOKOSmart',
        txPower: -4,
        temperature: 22.5,
        humidity: 45,
        isConnected: true
      },
      {
        id: 'M4P-002', 
        name: 'M4P Beacon 002',
        distance: 5.8,
        rssi: -68,
        batteryLevel: 78,
        lastSeen: new Date(),
        manufacturer: 'MOKOSmart',
        txPower: -4,
        temperature: 21.8,
        humidity: 48,
        isConnected: true
      },
      {
        id: 'M4P-003',
        name: 'M4P Beacon 003', 
        distance: 12.3,
        rssi: -82,
        batteryLevel: 92,
        lastSeen: new Date(),
        manufacturer: 'MOKOSmart',
        txPower: -4,
        temperature: 23.1,
        humidity: 42,
        isConnected: false
      }
    ]
  }
}

// Export singleton instance
export const bluetoothService = new BluetoothService()

// ✅ ADD THESE MISSING UTILITY FUNCTIONS:

// Helper function to format distance for display
export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance * 100)}cm`
  } else if (distance < 10) {
    return `${distance.toFixed(1)}m`
  } else {
    return `${Math.round(distance)}m`
  }
}

// Get signal strength category from RSSI
export const getSignalStrength = (rssi: number): 'excellent' | 'good' | 'fair' | 'poor' => {
  if (rssi >= -50) return 'excellent'
  if (rssi >= -65) return 'good' 
  if (rssi >= -80) return 'fair'
  return 'poor'
}

// Get color class for distance display
export const getDistanceColor = (distance: number): string => {
  if (distance < 2) return 'text-green-600'
  if (distance < 5) return 'text-yellow-600'
  if (distance < 10) return 'text-orange-600'
  return 'text-red-600'
}