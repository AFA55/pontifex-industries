// src/components/Dashboard.tsx - WORLD-CLASS MOBILE-FIRST TRANSFORMATION
'use client';

/**
 * Architecture Note: This component uses DashboardAsset type instead of the shared Asset type
 * to avoid conflicts with existing Asset types in AssetDetailsModal and QRScannerModal.
 * Type casting is used at modal boundaries to maintain compatibility.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import AddAssetModal from './AddAssetModal';
import AssetDetailsModal from './AssetDetailsModal';
import QRScannerModal from './QRScannerModal';
import QRQuickViewModal from './QRQuickViewModal';
import QuickEditModal from './QuickEditModal';
import QuickMoveModal from './QuickMoveModal';
import BulkOperationsModal from './BulkOperationsModal';
import BeaconScannerModal from './BeaconScannerModal'; // ✅ NEW IMPORT
import { 
  Search, 
  Plus, 
  QrCode, 
  ArrowUpDown, 
  MapPin, 
  Clock, 
  Wrench, 
  CheckCircle, 
  AlertTriangle,
  Circle,
  RefreshCw,
  Filter,
  MoreVertical,
  Bluetooth // ✅ NEW IMPORT
} from 'lucide-react';

// Use generic type to avoid conflicts with other Asset definitions
type DashboardAsset = {
  id: string;
  asset_id?: string;
  name?: string;
  description?: string;
  brand?: string;
  model?: string;
  category?: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  location?: string | { name: string }; // Handle both string and object types
  current_location_id?: string;
  purchase_price?: number;
  qr_code?: string;
  last_updated?: string;
  assigned_to?: string | { name: string }; // Handle both string and object types
  serial_number?: string;
  purchase_date?: string;
  next_maintenance?: string;
  created_at?: string;
};

interface DashboardStats {
  total: number;
  available: number;
  in_use: number;
  maintenance: number;
}

const Dashboard: React.FC = () => {
  // State Management - Using flexible typing for cross-component compatibility
  const [assets, setAssets] = useState<DashboardAsset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<DashboardAsset[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ total: 0, available: 0, in_use: 0, maintenance: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedAsset, setSelectedAsset] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showQRQuickView, setShowQRQuickView] = useState(false);
  const [showQuickEdit, setShowQuickEdit] = useState(false);
  const [showQuickMove, setShowQuickMove] = useState(false);
  const [showBulkOperations, setShowBulkOperations] = useState(false);
  const [showBeaconScanner, setShowBeaconScanner] = useState(false); // ✅ NEW STATE
  const [refreshing, setRefreshing] = useState(false);

  const { signOut } = useAuth();
  const { toast } = useToast();

  // Helper function to safely extract string values from potential objects
  const getStringValue = (value: string | { name: string } | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    return '';
  };

  // Status Configuration with 2025 Design Elements
  const statusConfig = {
    available: { 
      icon: CheckCircle, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10', 
      border: 'border-green-500/20',
      glow: 'green-500/10',
      label: 'Available'
    },
    in_use: { 
      icon: Circle, 
      color: 'text-orange-500', 
      bg: 'bg-orange-500/10', 
      border: 'border-orange-500/20',
      glow: 'orange-500/10',
      label: 'In Use'
    },
    maintenance: { 
      icon: AlertTriangle, 
      color: 'text-red-500', 
      bg: 'bg-red-500/10', 
      border: 'border-red-500/20',
      glow: 'red-500/15',
      label: 'Maintenance'
    },
    offline: { 
      icon: Circle, 
      color: 'text-gray-400', 
      bg: 'bg-gray-400/10', 
      border: 'border-gray-400/20',
      glow: 'gray-400/10',
      label: 'Offline'
    }
  };

  // Data Fetching with Real-time Updates
  const fetchAssets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        toast({ title: "Error", description: "Failed to load assets", variant: "destructive" });
        return;
      }

      setAssets(data || []);
      calculateStats(data || []);
    } catch (fetchError) {
      console.error('Error fetching assets:', fetchError);
      toast({ title: "Error", description: "Failed to load assets", variant: "destructive" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [toast]);

  // Statistics Calculation
  const calculateStats = (assetData: DashboardAsset[]) => {
    const total = assetData.length;
    const available = assetData.filter(asset => asset.status === 'available').length;
    const in_use = assetData.filter(asset => asset.status === 'in_use').length;
    const maintenance = assetData.filter(asset => asset.status === 'maintenance').length;
    
    setStats({ total, available, in_use, maintenance });
  };

  // Search and Filter Logic
  useEffect(() => {
    let filtered = assets;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getStringValue(asset.location).toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(asset => asset.status === filterStatus);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, filterStatus]);

  // Real-time subscription
  useEffect(() => {
    fetchAssets();

    // Set up real-time subscription
    const subscription = supabase
      .channel('assets')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'assets' }, () => {
        fetchAssets();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchAssets]);

  // Pull to refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAssets();
  };

  // Time formatting
  const formatTimeAgo = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch {
      return 'Unknown';
    }
  };

  // Asset card click handler
  const handleAssetClick = (asset: DashboardAsset) => {
    setSelectedAsset(asset);
    setShowDetailsModal(true);
  };

  // ✅ NEW: Beacon pairing success handler
  const handleBeaconPaired = (beaconId: string, assetId: string) => {
    console.log('Beacon paired:', beaconId, 'with asset:', assetId);
    fetchAssets(); // Refresh asset list to show beacon assignments
    toast({
      title: "Beacon Paired Successfully!",
      description: `Real-time tracking is now active for this asset`,
      variant: "default"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header with Glassmorphism Effect */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                  <Wrench className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">Asset Control</h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Pontifex Industries</p>
                </div>
              </div>
            </div>
            <button
              onClick={signOut}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Live Stats Dashboard - Bento Grid Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Assets */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Assets</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Available */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Available</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* In Use */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-orange-600">{stats.in_use}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">In Use</p>
              </div>
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                <Circle className="w-5 h-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Maintenance */}
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">Maintenance</p>
              </div>
              <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ UPDATED: Quick Actions - Construction Worker Optimized with BLE Scanner */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* QR Scanner - Prominent for field workers */}
          <button
            onClick={() => setShowQRScanner(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-2xl p-6 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            <QrCode className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">QR Scanner</p>
              <p className="text-blue-100 text-sm">Quick asset check-in/out</p>
            </div>
          </button>

          {/* Add Asset */}
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-2xl p-6 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25"
          >
            <Plus className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">Add Asset</p>
              <p className="text-green-100 text-sm">Register new equipment</p>
            </div>
          </button>

          {/* ✅ NEW: BLE Scanner */}
          <button
            onClick={() => setShowBeaconScanner(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl p-6 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            <Bluetooth className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">BLE Scanner</p>
              <p className="text-purple-100 text-sm">Pair M4P beacons</p>
            </div>
          </button>

          {/* Bulk Transfer */}
          <button
            onClick={() => setShowBulkOperations(true)}
            className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-2xl p-6 flex items-center space-x-4 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-orange-500/25"
          >
            <ArrowUpDown className="w-8 h-8" />
            <div className="text-left">
              <p className="font-semibold text-lg">Bulk Transfer</p>
              <p className="text-orange-100 text-sm">Move multiple assets</p>
            </div>
          </button>
        </div>

        {/* Search and Filter Controls */}
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-4 mb-6 border border-white/20">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search assets, categories, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 dark:text-white placeholder-slate-500"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 bg-white/50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl transition-colors flex items-center space-x-2 min-w-[100px] justify-center"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Asset Cards Grid - Mobile-First Bento Layout */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/70 dark:bg-slate-800/70 rounded-2xl p-6 border border-white/20 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-white/20">
            <Wrench className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Assets Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first piece of equipment'
              }
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
            >
              Add First Asset
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => {
              const statusInfo = statusConfig[asset.status];
              const StatusIcon = statusInfo.icon;
              
              return (
                <div
                  key={asset.id}
                  onClick={() => handleAssetClick(asset)}
                  className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                >
                  {/* Asset Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${statusInfo.bg} rounded-xl flex items-center justify-center ${statusInfo.border} border`}>
                        <Wrench className={`w-6 h-6 ${statusInfo.color}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                          {asset.name || 'Unnamed Asset'}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          #{asset.serial_number || asset.asset_id || asset.id.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.border} border mb-4`}>
                    <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                    <span className={`text-sm font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Asset Details */}
                  <div className="space-y-3">
                    {/* Location */}
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        {getStringValue(asset.location) || 'Unknown Location'}
                      </span>
                    </div>

                    {/* Last Updated */}
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-400">
                        Last: {formatTimeAgo(asset.last_updated)}
                      </span>
                    </div>

                    {/* Category */}
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-md text-xs">
                        {asset.category || 'Uncategorized'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Actions - 44px+ Touch Targets */}
                  <div className="flex justify-between mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setShowQRQuickView(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl transition-colors text-sm font-medium min-h-[44px]"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>QR</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setShowQuickEdit(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-50 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl transition-colors text-sm font-medium min-h-[44px]"
                    >
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setShowQuickMove(true);
                      }}
                      className="flex items-center space-x-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/30 dark:hover:bg-orange-900/50 text-orange-600 dark:text-orange-400 rounded-xl transition-colors text-sm font-medium min-h-[44px]"
                    >
                      <ArrowUpDown className="w-4 h-4" />
                      <span>Move</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ✅ UPDATED: Modals - Added BeaconScannerModal */}
      {showAddModal && (
        <AddAssetModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAssetAdded={fetchAssets}
        />
      )}

      {showDetailsModal && selectedAsset && (
        <AssetDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          asset={selectedAsset}
          onAssetUpdated={fetchAssets}
        />
      )}

      {showQRScanner && (
        <QRScannerModal
          isOpen={showQRScanner}
          onClose={() => setShowQRScanner(false)}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onAssetFound={(asset: any) => {
            setSelectedAsset(asset);
            setShowDetailsModal(true);
            setShowQRScanner(false);
          }}
        />
      )}

      {showQRQuickView && selectedAsset && (
        <QRQuickViewModal
          isOpen={showQRQuickView}
          onClose={() => setShowQRQuickView(false)}
          asset={selectedAsset}
        />
      )}

      {showQuickEdit && selectedAsset && (
        <QuickEditModal
          isOpen={showQuickEdit}
          onClose={() => setShowQuickEdit(false)}
          asset={selectedAsset}
          onAssetUpdated={fetchAssets}
        />
      )}

      {showQuickMove && selectedAsset && (
        <QuickMoveModal
          isOpen={showQuickMove}
          onClose={() => setShowQuickMove(false)}
          asset={selectedAsset}
          onAssetUpdated={fetchAssets}
        />
      )}

      {showBulkOperations && (
        <BulkOperationsModal
          isOpen={showBulkOperations}
          onClose={() => setShowBulkOperations(false)}
          assets={filteredAssets.map(asset => ({
            ...asset,
            location: getStringValue(asset.location),
            assigned_to: getStringValue(asset.assigned_to)
          }))}
          onAssetsUpdated={fetchAssets}
        />
      )}

      {/* ✅ NEW: Beacon Scanner Modal */}
      {showBeaconScanner && (
        <BeaconScannerModal
          isOpen={showBeaconScanner}
          onClose={() => setShowBeaconScanner(false)}
          onBeaconPaired={handleBeaconPaired}
        />
      )}
    </div>
  );
};

export default Dashboard;