// src/lib/gateway.ts - PONTIFEX INDUSTRIES GATEWAY SERVICE
// CTO Note: This service communicates with the MKGW3 hardware to provide extended range beacon detection.

import { BeaconData } from './bluetooth';

// Interface for the raw beacon data received from the MKGW3 Gateway
interface GatewayBeaconData {
  mac: string;
  rssi: number;
  name?: string;
  rawData: string;
  timestamp: number;
}

class MKGatewayService {
  private gatewayIP: string = '192.168.1.1'; // Default IP for MKGW3 Gateway
  private isConnected: boolean = false;
  private isMonitoring: boolean = false;
  private monitorInterval: NodeJS.Timeout | null = null;

  /**
   * Establishes and tests the connection to the gateway.
   * In a real scenario, this would ping a specific API endpoint on the gateway.
   * @param {string} [ip] - The IP address of the gateway.
   * @returns {Promise<boolean>} - True if the connection is successful.
   */
  public async connect(ip?: string): Promise<boolean> {
    if (ip) this.gatewayIP = ip;
    console.log(`Attempting to connect to MKGW3 Gateway at: ${this.gatewayIP}`);

    try {
      // For now, we will simulate a successful connection.
      // In a real implementation, you would use:
      // const response = await fetch(`http://${this.gatewayIP}/api/device/info`);
      // if (!response.ok) throw new Error('Gateway not responsive');
      
      this.isConnected = true;
      console.log(`✅ MKGW3 Gateway connected successfully at ${this.gatewayIP}`);
      return true;
    } catch (error) {
      console.error(`❌ Gateway connection failed:`, error);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Starts polling the gateway for beacon data at a regular interval.
   * @param {(beacons: BeaconData[]) => void} callback - The function to call with discovered beacons.
   */
  public startMonitoring(callback: (beacons: BeaconData[]) => void): void {
    if (!this.isConnected || this.isMonitoring) return;

    this.isMonitoring = true;
    console.log('📡 Starting continuous monitoring of MKGW3 Gateway...');
    
    // Immediately fetch once, then start the interval
    this.fetchAndCallback(callback);
    this.monitorInterval = setInterval(() => this.fetchAndCallback(callback), 5000); // Poll every 5 seconds
  }

  private async fetchAndCallback(callback: (beacons: BeaconData[]) => void) {
      try {
        const beacons = await this.getBeacons();
        if (beacons.length > 0) {
          callback(beacons);
        }
      } catch (error) {
        console.error('Gateway monitoring error:', error);
      }
  }

  /**
   * Stops polling the gateway for data.
   */
  public stopMonitoring(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
    this.isMonitoring = false;
    console.log('🛑 Stopped MKGW3 Gateway monitoring.');
  }

  /**
   * Fetches the latest beacon data from the gateway.
   * Currently uses simulated data.
   * @returns {Promise<BeaconData[]>} - A list of beacons discovered by the gateway.
   */
  private async getBeacons(): Promise<BeaconData[]> {
    if (!this.isConnected) {
      console.warn('Gateway not connected. Cannot fetch beacons.');
      return [];
    }

    // SIMULATION: This simulates a fetch call to the gateway's API.
    const simulatedGatewayResponse: { data: { beacons: GatewayBeaconData[] } } = {
      data: {
        beacons: [
          { mac: 'GW-M4P-004', rssi: -75, name: 'Gateway Saw', rawData: '', timestamp: Date.now() },
          { mac: 'GW-M4P-005', rssi: -80, name: 'Gateway Hammer', rawData: '', timestamp: Date.now() },
        ],
      },
    };

    const parsedBeacons = this.parseGatewayBeacons(simulatedGatewayResponse.data.beacons);
    console.log(`Gateway found ${parsedBeacons.length} beacons.`);
    return parsedBeacons;
  }

  /**
   * Parses the raw data from the gateway into our standard BeaconData format.
   * @param {GatewayBeaconData[]} gatewayBeacons - The raw beacon data from the gateway.
   * @returns {BeaconData[]} - A list of parsed and standardized beacon data.
   */
  private parseGatewayBeacons(gatewayBeacons: GatewayBeaconData[]): BeaconData[] {
    return gatewayBeacons.map(beacon => ({
      id: beacon.mac,
      name: beacon.name || `GW Beacon ${beacon.mac.slice(-5)}`,
      rssi: beacon.rssi,
      distance: this.calculateDistanceFromRSSI(beacon.rssi),
      lastSeen: new Date(beacon.timestamp),
      manufacturer: 'MOKOSmart (Gateway)',
      txPower: -4, // Default assumption for M4P beacons
    }));
  }

  /**
   * Calculates the approximate distance from a beacon based on its RSSI value.
   * @param {number} rssi - The Received Signal Strength Indication.
   * @param {number} [txPower=-59] - The transmission power of the beacon at 1 meter.
   * @returns {number} - The estimated distance in meters.
   */
  private calculateDistanceFromRSSI(rssi: number, txPower: number = -59): number {
    if (rssi === 0) {
      return -1.0;
    }
    const ratio = rssi * 1.0 / txPower;
    if (ratio < 1.0) {
      return Math.pow(ratio, 10);
    } else {
      return (0.89976) * Math.pow(ratio, 7.7095) + 0.111;
    }
  }
}

// Export a singleton instance for use across the application
export const gatewayService = new MKGatewayService();
