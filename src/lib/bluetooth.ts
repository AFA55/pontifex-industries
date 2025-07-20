// src/lib/bluetooth.ts - WORLD-CLASS HARDWARE INTEGRATION
// CTO Note: This version integrates real M4P Pro beacon detection and gracefully falls back to simulation.

export interface BeaconData {
  id: string;
  name: string;
  distance: number;
  rssi: number;
  battery?: number;
  lastSeen: Date;
  manufacturer?: string;
  txPower?: number;
  // Temperature and humidity removed as they are not supported by M4P Pro beacons.
}

// Utility function to format distance for display
export function formatDistance(meters: number): string {
  if (meters < 0) return 'Unknown';
  if (meters < 1) return `${(meters * 100).toFixed(0)} cm`;
  return `${meters.toFixed(1)} m`;
}

// Utility function to determine signal strength category
export function getSignalStrength(rssi: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (rssi > -60) return 'excellent';
  if (rssi > -70) return 'good';
  if (rssi > -80) return 'fair';
  return 'poor';
}

// Utility function to get a color based on distance
export function getDistanceColor(distance: number): string {
  if (distance < 0) return 'text-gray-500';
  if (distance < 3) return 'text-green-600';
  if (distance < 10) return 'text-blue-600';
  return 'text-orange-600';
}


export class BluetoothService {
  private scanning = false;
  private devices = new Map<string, BluetoothDevice>();
  private scanCallback: (beacons: BeaconData[]) => void = () => {};

  async isBluetoothAvailable(): Promise<boolean> {
    try {
      if (typeof navigator === 'undefined' || !navigator.bluetooth) {
        console.warn('Web Bluetooth API not supported in this browser or context.');
        return false;
      }
      return await navigator.bluetooth.getAvailability();
    } catch (error) {
      console.error('Bluetooth availability check failed:', error);
      return false;
    }
  }

  // Enhanced startScanning method to prioritize real hardware
  async startScanning(callback: (beacons: BeaconData[]) => void): Promise<void> {
    if (this.scanning) return;

    this.scanning = true;
    this.scanCallback = callback;
    console.log('Starting M4P Pro beacon scanning...');

    try {
      // Enhanced filters for real M4P Pro beacons as per the roadmap
      const device = await navigator.bluetooth!.requestDevice({
        filters: [
          { namePrefix: "M4P" },
          { namePrefix: "MOKO" },
          { namePrefix: "MOKOSmart" },
        ],
        optionalServices: [
          'battery_service',       // 0x180F for battery level
          'device_information',    // 0x180A for device info
        ],
      });

      console.log('✅ M4P Beacon detected:', device.name, device.id);
      await this.connectToM4PBeacon(device);

    } catch (error: any) {
      console.error('❌ M4P scanning failed:', error.name, error.message);

      // Fallback to simulation if no hardware is found or user cancels
      if (error.name === 'NotFoundError') {
        console.warn('⚠️ No M4P beacons found, using simulation mode for development.');
        this.simulateBeaconDetection(callback);
      } else {
        // Re-throw other critical errors
        throw new Error('Bluetooth scanning failed. Please ensure Bluetooth is enabled and permissions are granted.');
      }
    }
  }

  // New method specifically for connecting to and reading data from M4P beacons
  async connectToM4PBeacon(device: BluetoothDevice): Promise<void> {
    try {
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      this.devices.set(device.id, device);

      // Get battery level from the M4P beacon
      let batteryLevel: number | undefined;
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryCharacteristic.readValue();
        batteryLevel = batteryValue.getUint8(0);
        console.log(`🔋 M4P Battery for ${device.name}:`, batteryLevel + '%');
      } catch {
        console.warn('Battery service not available on this M4P beacon.');
      }

      // Get manufacturer name
      let manufacturer = 'MOKOSmart'; // Default value
      try {
        const deviceInfoService = await server.getPrimaryService('device_information');
        const manufacturerCharacteristic = await deviceInfoService.getCharacteristic('manufacturer_name_string');
        const manufacturerValue = await manufacturerCharacteristic.readValue();
        manufacturer = new TextDecoder().decode(manufacturerValue);
      } catch {
        console.warn('Device info service not available on this M4P beacon.');
      }

      // Create beacon data with real M4P info
      const beaconData: BeaconData = {
        id: device.id,
        name: device.name || `M4P-${device.id.substring(0, 6)}`,
        distance: 1.5, // Placeholder, will be updated from RSSI in a future step
        rssi: -55,     // Placeholder
        battery: batteryLevel,
        lastSeen: new Date(),
        manufacturer: manufacturer,
        txPower: -4, // M4P default TX power
      };

      // Notify the UI with the real beacon data
      this.scanCallback([beaconData]);

    } catch (error) {
      console.error(`Failed to connect to M4P beacon ${device.id}:`, error);
      throw error;
    }
  }

  // This is your original simulation function, now used as a fallback
  simulateBeaconDetection(callback: (beacons: BeaconData[]) => void) {
    const simulatedBeacons: BeaconData[] = [
      {
        id: 'SIM-M4P-001',
        name: 'Simulated M4P Drill',
        distance: 2.1,
        rssi: -55,
        battery: 95,
        lastSeen: new Date(),
        manufacturer: 'MOKOSmart (Simulated)',
        txPower: -4,
      },
      {
        id: 'SIM-M4P-002', 
        name: 'Simulated M4P Saw',
        distance: 5.8,
        rssi: -68,
        battery: 78,
        lastSeen: new Date(),
        manufacturer: 'MOKOSmart (Simulated)',
        txPower: -4,
      }
    ];
    callback(simulatedBeacons);
  }

  stopScanning(): void {
    this.scanning = false;
    this.devices.forEach(device => device.gatt?.disconnect());
    this.devices.clear();
    console.log('🛑 Bluetooth scanning stopped and all devices disconnected.');
  }

  async pairBeaconWithAsset(beaconId: string, assetId: string): Promise<boolean> {
    try {
      console.log(`Pairing beacon ${beaconId} with asset ${assetId}`);
      // In a real scenario, this would involve a call to your Supabase backend
      return true;
    } catch (error) {
      console.error('Pairing failed:', error);
      return false;
    }
  }
}

// Export a singleton instance to be used across the application
export const bluetoothService = new BluetoothService();