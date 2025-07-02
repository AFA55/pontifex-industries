// src/components/BeaconScannerModal.tsx - DUAL DETECTION (BLE + GATEWAY)
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Bluetooth, Radar, Battery, Link, CheckCircle, Loader2, Wifi } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { bluetoothService, BeaconData, formatDistance, getSignalStrength, getDistanceColor } from '@/lib/bluetooth'
import { gatewayService } from '@/lib/gateway' // Import the new gateway service
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
  beacon_id?: string;
}

export default function BeaconScannerModal({ isOpen, onClose, onBeaconPaired }: BeaconScannerModalProps) {
  const [scanning, setScanning] = useState(false)
  const [detectedBeacons, setDetectedBeacons] = useState<BeaconData[]>([])
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([])
  const [selectedBeacon, setSelectedBeacon] = useState<BeaconData | null>(null)
  const [selectedAsset, setSelectedAsset] = useState<string>('')
  const [pairingMode, setPairingMode] = useState(false)
  const [bluetoothSupported, setBluetoothSupported] = useState(false)
  const [gatewayConnected, setGatewayConnected] = useState(false);
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { toast } = useToast()

  const loadAvailableAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('id, name, asset_id, status, assigned_location, beacon_id')
        .is('beacon_id', null) // Only show assets not yet paired with a beacon
        .order('name')

      if (error) throw error
      setAvailableAssets(data || [])
    } catch (dbError) {
      console.error('Error loading assets:', dbError)
      toast({ title: "Database Error", description: "Failed to load available assets", variant: "destructive" })
    }
  }, [toast])


  useEffect(() => {
    const initialize = async () => {
        const isBtSupported = await bluetoothService.isBluetoothAvailable();
        setBluetoothSupported(isBtSupported);
        if (!isBtSupported) {
            setError('Web Bluetooth API not supported. Please use Chrome/Edge on desktop.');
        }

        const isGwConnected = await gatewayService.connect();
        setGatewayConnected(isGwConnected);

        if (isOpen) {
            loadAvailableAssets();
        }
    };
    if (isOpen) {
      initialize();
    }
  }, [isOpen, loadAvailableAssets]);

  // Merged callback for both BLE and Gateway services
  const handleBeaconDetection = useCallback((beacons: BeaconData[]) => {
    setDetectedBeacons(prevBeacons => {
      const beaconMap = new Map(prevBeacons.map(b => [b.id, b]));
      beacons.forEach(newBeacon => {
        beaconMap.set(newBeacon.id, { ...beaconMap.get(newBeacon.id), ...newBeacon, lastSeen: new Date() });
      });
      return Array.from(beaconMap.values()).sort((a, b) => (b.rssi || -100) - (a.rssi || -100));
    });
  }, []);

  const startScanning = async () => {
    setError('');
    setLoading(true);
    setDetectedBeacons([]);

    // Strategy: Start both direct BLE and Gateway monitoring
    let directScanStarted = false;
    try {
      if (bluetoothSupported) {
        await bluetoothService.startScanning(handleBeaconDetection);
        directScanStarted = true;
        toast({ title: "Direct Scan Active", description: "Searching for nearby M4P beacons...", variant: "default" });
      }
    } catch (btError: any) {
        setError(btError.message || 'Direct Bluetooth scan failed.');
        console.error("Direct BLE Scan Error:", btError);
    }

    if (gatewayConnected) {
        gatewayService.startMonitoring(handleBeaconDetection);
        toast({ title: "Gateway Scan Active", description: "Monitoring for extended range beacons.", variant: "info" });
    }

    if(directScanStarted || gatewayConnected) {
        setScanning(true);
    } else {
        setError("Neither Direct Bluetooth nor Gateway is available to scan.");
    }
    
    setLoading(false);
  };

  const stopScanning = () => {
    if (bluetoothSupported) bluetoothService.stopScanning();
    if (gatewayConnected) gatewayService.stopMonitoring();
    setScanning(false);
    toast({ title: "Scanning Stopped", description: "All beacon scanning has been stopped.", variant: "default" });
  };

  const handlePairBeacon = async () => {
    if (!selectedBeacon || !selectedAsset) {
      setError('Please select both a beacon and an asset to pair.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Step 1: Update the asset to link it with the beacon_id
      const { error: assetError } = await supabase
        .from('assets')
        .update({ beacon_id: selectedBeacon.id, last_updated: new Date().toISOString() })
        .eq('id', selectedAsset);

      if (assetError) throw assetError;

      // Step 2: Create a record in the asset_beacons table
      const { error: beaconError } = await supabase
        .from('asset_beacons')
        .insert({
          asset_id: selectedAsset,
          beacon_id: selectedBeacon.id,
          beacon_name: selectedBeacon.name,
          mac_address: selectedBeacon.id, // Assuming MAC is used as ID
          battery_level: selectedBeacon.battery,
          last_seen: new Date().toISOString(),
          paired_at: new Date().toISOString(),
          is_active: true,
        });
      
      if (beaconError) throw beaconError;

      const assetName = availableAssets.find(a => a.id === selectedAsset)?.name;
      toast({ title: "✅ Pairing Successful!", description: `${selectedBeacon.name} is now tracking ${assetName}.`, variant: "success" });

      if (onBeaconPaired) onBeaconPaired(selectedBeacon.id, selectedAsset);
      
      setPairingMode(false);
      setSelectedBeacon(null);
      setSelectedAsset('');
      await loadAvailableAssets(); // Refresh the list of available assets

    } catch (error: any) {
      console.error('Pairing error:', error);
      setError(`Pairing failed: ${error.message}`);
      toast({ title: "❌ Pairing Failed", description: "Could not pair beacon. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getBatteryColor = (level?: number) => {
    if (level === undefined) return 'text-gray-400';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-orange-500';
    return 'text-red-500';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b bg-slate-50 rounded-t-2xl">
          <div className="flex items-center space-x-4">
            <Bluetooth className="h-7 w-7 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-slate-800">BLE Beacon Manager</h2>
              <p className="text-sm text-slate-500">M4P Pro & MKGW3 Gateway Integration</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors">
            <X className="h-6 w-6 text-slate-600" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="bg-slate-100 rounded-xl p-4 mb-6 border">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 ${bluetoothSupported ? 'text-green-600' : 'text-red-600'}`}>
                        <Bluetooth className="w-5 h-5" /> <span className="text-sm font-medium">Direct Scan</span>
                    </div>
                    <div className={`flex items-center gap-2 ${gatewayConnected ? 'text-green-600' : 'text-red-600'}`}>
                        <Wifi className="w-5 h-5" /> <span className="text-sm font-medium">Gateway Scan</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    {!scanning ? (
                        <button onClick={startScanning} disabled={loading} className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:opacity-50">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Radar className="w-5 h-5" />}
                            <span>Start Scanning</span>
                        </button>
                    ) : (
                        <button onClick={stopScanning} className="flex items-center justify-center gap-2 w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-colors">
                            <div className="w-3 h-3 bg-white rounded-full animate-ping" />
                            <span>Stop Scanning</span>
                        </button>
                    )}
                </div>
            </div>
            {error && <div className="mt-4 text-center text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Detected Beacons ({detectedBeacons.length})</h3>
              <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                {detectedBeacons.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">
                    <p>{scanning ? 'Searching for beacons...' : 'No beacons detected. Start scanning.'}</p>
                  </div>
                ) : (
                  detectedBeacons.map((beacon) => (
                    <div key={beacon.id} onClick={() => pairingMode && setSelectedBeacon(beacon)} className={`p-4 border rounded-xl transition-all ${pairingMode ? 'cursor-pointer' : ''} ${selectedBeacon?.id === beacon.id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 hover:border-blue-400'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-800">{beacon.name}</p>
                          <p className="text-xs text-slate-500 font-mono">{beacon.id}</p>
                        </div>
                        <span className={`text-xs font-bold ${getSignalStrength(beacon.rssi) === 'excellent' ? 'text-green-600' : 'text-slate-500'}`}>{beacon.rssi} dBm</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs mt-3 pt-3 border-t">
                          <div><span className="font-medium">Dist:</span> {formatDistance(beacon.distance)}</div>
                          <div className="flex items-center gap-1"><Battery className={`w-4 h-4 ${getBatteryColor(beacon.battery)}`} /> {beacon.battery ?? 'N/A'}%</div>
                          <div><span className="font-medium">Source:</span> {beacon.manufacturer?.includes('Gateway') ? 'Gateway' : 'Direct'}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-slate-700">Asset Pairing</h3>
              <div className="space-y-4 bg-slate-50 p-4 rounded-xl border">
                 <button onClick={() => setPairingMode(!pairingMode)} className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${pairingMode ? 'bg-green-600 text-white' : 'bg-slate-200 text-slate-800'}`}>
                    <Link className="w-5 h-5" />
                    <span>{pairingMode ? 'Pairing Mode Active' : 'Enable Pairing'}</span>
                 </button>
                 {pairingMode && (
                    <div className="space-y-4">
                        {selectedBeacon && <p className="text-sm text-center font-medium bg-blue-100 text-blue-800 p-2 rounded-md">Selected Beacon: {selectedBeacon.name}</p>}
                        <div>
                            <label className="text-sm font-medium text-slate-600 block mb-1">Available Assets</label>
                            <select value={selectedAsset} onChange={(e) => setSelectedAsset(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md">
                                <option value="">Select an asset to pair...</option>
                                {availableAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.name} (#{asset.asset_id})</option>)}
                            </select>
                        </div>
                        <button onClick={handlePairBeacon} disabled={!selectedBeacon || !selectedAsset || loading} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold transition-colors disabled:opacity-50">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                            <span>Confirm Pairing</span>
                        </button>
                    </div>
                 )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
