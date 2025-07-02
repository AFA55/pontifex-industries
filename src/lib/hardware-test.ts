// src/lib/hardware-test.ts - PONTIFEX INDUSTRIES HARDWARE VALIDATION SUITE
// CTO Note: This suite validates our core integrations (Bluetooth, Gateway, Database)
// to ensure system readiness and provides clear diagnostics for debugging.

import { supabase } from './supabase';
import { bluetoothService } from './bluetooth';
import { gatewayService } from './gateway';

// Defines the structure for a single test result
export interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'ERROR';
  duration: number; // in milliseconds
  details: string;
  error?: string;
}

// A comprehensive suite for testing all hardware and service integrations
export class HardwareTestSuite {
  private testResults: TestResult[] = [];

  /**
   * Runs all validation tests in sequence.
   * @returns {Promise<TestResult[]>} A promise that resolves with an array of test results.
   */
  public async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Pontifex Industries Hardware Test Suite...');
    this.testResults = [];

    await this.runTest(this.testWebBluetoothAPI);
    await this.runTest(this.testM4PBeaconDetection);
    await this.runTest(this.testGatewayConnection);
    await this.runTest(this.testDatabaseConnection);

    console.log('✅ Hardware Test Suite completed.');
    return this.testResults;
  }

  // A helper to run a single test and capture its results
  private async runTest(testFn: () => Promise<TestResult>): Promise<void> {
    const result = await testFn.call(this);
    this.testResults.push(result);
  }

  // Test 1: Checks if the browser supports the Web Bluetooth API
  private async testWebBluetoothAPI(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const isSupported = await bluetoothService.isBluetoothAvailable();
      return {
        test: 'Web Bluetooth API Support',
        status: isSupported ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        details: isSupported ? 'Browser supports Web Bluetooth.' : 'Browser does not support Web Bluetooth. Use Chrome/Edge on Desktop.',
      };
    } catch (error: any) {
      return {
        test: 'Web Bluetooth API Support',
        status: 'ERROR',
        duration: Date.now() - startTime,
        details: 'An error occurred while checking for Bluetooth support.',
        error: error.message,
      };
    }
  }

  // Test 2: Attempts to scan for a real M4P beacon
  private async testM4PBeaconDetection(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      // This will trigger the browser's device selection prompt.
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'M4P' }],
        optionalServices: ['battery_service'],
      });
      return {
        test: 'M4P Beacon Detection',
        status: 'PASS',
        duration: Date.now() - startTime,
        details: `Successfully found beacon: ${device.name || 'Unnamed M4P'}`,
      };
    } catch (error: any) {
      if (error.name === 'NotFoundError') {
        return {
          test: 'M4P Beacon Detection',
          status: 'WARN',
          duration: Date.now() - startTime,
          details: 'User cancelled prompt or no M4P beacons found. This may be expected if none are in range.',
        };
      }
      return {
        test: 'M4P Beacon Detection',
        status: 'ERROR',
        duration: Date.now() - startTime,
        details: 'An error occurred during beacon scan.',
        error: error.message,
      };
    }
  }

  // Test 3: Attempts to connect to the MKGW3 Gateway
  private async testGatewayConnection(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const isConnected = await gatewayService.connect();
      return {
        test: 'MKGW3 Gateway Connection',
        status: isConnected ? 'PASS' : 'FAIL',
        duration: Date.now() - startTime,
        details: isConnected ? 'Successfully connected to the gateway.' : 'Could not connect to the gateway. Check IP and network.',
      };
    } catch (error: any) {
      return {
        test: 'MKGW3 Gateway Connection',
        status: 'ERROR',
        duration: Date.now() - startTime,
        details: 'An error occurred while connecting to the gateway.',
        error: error.message,
      };
    }
  }

  // Test 4: Verifies the connection to the Supabase database
  private async testDatabaseConnection(): Promise<TestResult> {
    const startTime = Date.now();
    try {
      const { error } = await supabase.from('assets').select('id').limit(1);
      if (error) throw error;
      return {
        test: 'Supabase Database Connection',
        status: 'PASS',
        duration: Date.now() - startTime,
        details: 'Successfully queried the assets table.',
      };
    } catch (error: any) {
      return {
        test: 'Supabase Database Connection',
        status: 'FAIL',
        duration: Date.now() - startTime,
        details: 'Failed to connect to the database. Check API keys and RLS policies.',
        error: error.message,
      };
    }
  }
}
