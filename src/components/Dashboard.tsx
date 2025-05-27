'use client'

import React, { useState, useEffect } from 'react'
import { Search, QrCode, Plus, ArrowUpDown, MoreVertical, MapPin, DollarSign } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import AddAssetModal from './AddAssetModal'
import AssetDetailsModal from './AssetDetailsModal'
import QRScannerModal from './QRScannerModal'

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
  }
}

interface AssetStats {
  total: number
  available: number
  in_use: number
  maintenance: number
}

export default function Dashboard() {
  const [assets, setAssets] = useState<Asset[]>([])
  const [assetStats, setAssetStats] = useState<AssetStats>({
    total: 0,
    available: 0,
    in_use: 0,
    maintenance: 0
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isQRScannerOpen, setIsQRScannerOpen] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null)

  useEffect(() => {
    loadAssets()
  }, [])

  const loadAssets = async () => {
    setLoading(true)
    try {
      // Get current user's company
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .single()

      if (!profile) return

      // Load assets with location info
      const { data: assetsData, error } = await supabase
        .from('assets')
        .select(`
          *,
          location:locations!current_location_id(name)
        `)
        .eq('company_id', profile.company_id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setAssets(assetsData || [])

      // Calculate stats
      const stats = {
        total: assetsData?.length || 0,
        available: assetsData?.filter(a => a.status === 'available').length || 0,
        in_use: assetsData?.filter(a => a.status === 'in_use').length || 0,
        maintenance: assetsData?.filter(a => a.status === 'maintenance').length || 0
      }
      setAssetStats(stats)

    } catch (error) {
      console.error('Error loading assets:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.asset_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'in_use':
        return 'bg-orange-100 text-orange-800'
      case 'maintenance':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const handleAssetAdded = () => {
    loadAssets() // Refresh the asset list
  }

  const handleAssetClick = (asset: Asset) => {
    setSelectedAsset(asset)
    setIsDetailsModalOpen(true)
  }

  const handleAssetUpdated = () => {
    loadAssets() // Refresh the asset list
  }

  const handleQRAssetFound = (asset: Asset) => {
    // When QR scanner finds an asset, open its details
    setSelectedAsset(asset)
    setIsDetailsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Management Dashboard</h1>
              <p className="text-blue-100 mt-1">Pontifex Industries Asset Management</p>
              <p className="text-blue-200 text-sm mt-1">Welcome back, Demo User</p>
            </div>
            <div className="flex space-x-3">
              <button className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-lg transition-all">
                Admin Portal
              </button>
              <button className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-all">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assets</p>
                <p className="text-3xl font-bold text-gray-900">{assetStats.total}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <QrCode className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Available</p>
                <p className="text-3xl font-bold text-green-600">{assetStats.available}</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Use</p>
                <p className="text-3xl font-bold text-orange-600">{assetStats.in_use}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Maintenance</p>
                <p className="text-3xl font-bold text-red-600">{assetStats.maintenance}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button 
            onClick={() => setIsQRScannerOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-4">
              <QrCode className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <h3 className="text-lg font-semibold">QR Scanner</h3>
                <p className="text-blue-100 text-sm">Quick asset check-in/out</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center space-x-4">
              <Plus className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <h3 className="text-lg font-semibold">Add Asset</h3>
                <p className="text-teal-100 text-sm">Register new equipment</p>
              </div>
            </div>
          </button>

          <button className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center space-x-4">
              <ArrowUpDown className="h-8 w-8 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <h3 className="text-lg font-semibold">Bulk Transfer</h3>
                <p className="text-orange-100 text-sm">Move multiple assets</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Assets Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Recent Assets</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading assets...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAssets.map((asset) => (
                    <tr 
                      key={asset.id} 
                      onClick={() => handleAssetClick(asset)}
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <QrCode className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {asset.asset_id}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                        <div className="text-sm text-gray-500">
                          {asset.brand} {asset.model}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {asset.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(asset.status)}`}>
                          {asset.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                          {asset.location?.name || 'Unassigned'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-400 mr-1" />
                          {formatPrice(asset.purchase_price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-blue-600 hover:text-blue-900">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredAssets.length === 0 && !loading && (
                <div className="p-8 text-center">
                  <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No assets found matching your search.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAssetAdded={handleAssetAdded}
      />

      {/* Asset Details Modal */}
      <AssetDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        asset={selectedAsset}
        onAssetUpdated={handleAssetUpdated}
      />

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQRScannerOpen}
        onClose={() => setIsQRScannerOpen(false)}
        onAssetFound={handleQRAssetFound}
      />
    </div>
  )
}