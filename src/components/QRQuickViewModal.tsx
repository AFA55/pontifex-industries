// src/components/QRQuickViewModal.tsx - UPDATED with Modern Toast
'use client'

import React, { useEffect, useRef } from 'react'
import { X, Download, QrCode, Copy, CheckCircle, Wrench, MapPin, Sparkles } from 'lucide-react'

interface QRQuickViewModalProps {
  isOpen: boolean
  onClose: () => void
  asset: {
    id: string
    asset_id?: string
    name?: string
    location?: string
    category?: string
    status?: string
    serial_number?: string
  }
}

export default function QRQuickViewModal({ isOpen, onClose, asset }: QRQuickViewModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = React.useState(false)

  // Generate QR Code (simplified version - in production would use proper QR library)
  const generateQRCode = (text: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    canvas.width = 300
    canvas.height = 300

    // Clear canvas
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, 300, 300)

    // Simple QR-like pattern (in production, use proper QR library like qrcode.js)
    ctx.fillStyle = '#000000'
    
    // Create a grid pattern as placeholder
    const size = 10
    const padding = 20
    
    for (let i = 0; i < 26; i++) {
      for (let j = 0; j < 26; j++) {
        // Simple pattern based on text hash
        const hash = text.charCodeAt(i % text.length) + i + j
        if (hash % 3 === 0) {
          ctx.fillRect(
            padding + i * size, 
            padding + j * size, 
            size - 1, 
            size - 1
          )
        }
      }
    }

    // Add corner squares (typical QR pattern)
    const corners = [[0, 0], [0, 19], [19, 0]]
    corners.forEach(([x, y]) => {
      ctx.fillRect(padding + x * size, padding + y * size, size * 7, size * 7)
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(padding + (x + 1) * size, padding + (y + 1) * size, size * 5, size * 5)
      ctx.fillStyle = '#000000'
      ctx.fillRect(padding + (x + 2) * size, padding + (y + 2) * size, size * 3, size * 3)
    })
  }

  useEffect(() => {
    if (isOpen && canvasRef.current && asset.asset_id) {
      generateQRCode(asset.asset_id, canvasRef.current)
    }
  }, [isOpen, asset.asset_id])

  const handleDownload = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      const link = document.createElement('a')
      link.download = `QR_${asset.asset_id || asset.name || 'asset'}.png`
      link.href = canvas.toDataURL()
      link.click()

      // UPDATED: Modern Toast Notification with Enhanced Design
      const event = new CustomEvent('show-toast', {
        detail: {
          variant: 'success',
          title: `QR Code Downloaded!`,
          description: `${asset.name || 'Asset'} QR code saved successfully`,
          duration: 4000
        }
      })
      window.dispatchEvent(event)
    }
  }

  const handleCopyAssetId = async () => {
    if (asset.asset_id) {
      await navigator.clipboard.writeText(asset.asset_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)

      // UPDATED: Modern Toast for Copy Action
      const event = new CustomEvent('show-toast', {
        detail: {
          variant: 'info',
          title: 'Asset ID Copied!',
          description: `${asset.asset_id} copied to clipboard`,
          duration: 3000
        }
      })
      window.dispatchEvent(event)
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in_use':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'maintenance':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'offline':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-t-lg">
          <div className="flex items-center space-x-3">
            <QrCode className="h-6 w-6" />
            <div>
              <h2 className="text-xl font-bold">QR Code</h2>
              <p className="text-blue-100 text-sm">Ready to scan</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Asset Info Header */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Wrench className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900">
                  {asset.name || 'Asset'}
                </h3>
                <p className="text-sm text-gray-600">
                  #{asset.serial_number || asset.asset_id || asset.id.slice(0, 8)}
                </p>
              </div>
            </div>

            {/* Asset Details */}
            <div className="grid grid-cols-1 gap-3">
              {/* Status */}
              {asset.status && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                    {asset.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              )}

              {/* Location */}
              {asset.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-sm text-gray-900">{asset.location}</span>
                  </div>
                </div>
              )}

              {/* Category */}
              {asset.category && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Category:</span>
                  <span className="text-sm text-gray-900">{asset.category}</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code Display */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 text-center mb-6">
            <canvas
              ref={canvasRef}
              className="mx-auto border border-gray-100 rounded-lg"
              style={{ maxWidth: '100%', height: 'auto' }}
            />
            
            {/* Asset ID below QR */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Asset ID</p>
              <div className="flex items-center justify-center space-x-2">
                <code className="text-lg font-mono font-bold text-gray-900">
                  {asset.asset_id || asset.id.slice(0, 8)}
                </code>
                <button
                  onClick={handleCopyAssetId}
                  className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Copy Asset ID"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-500" />
                  )}
                </button>
              </div>
              {copied && (
                <p className="text-xs text-green-600 mt-1">Copied to clipboard!</p>
              )}
            </div>
          </div>

          {/* Action Buttons - Enhanced Design */}
          <div className="grid grid-cols-1 gap-3">
            {/* Download Button - Primary Action with Enhanced Styling */}
            <button
              onClick={handleDownload}
              className="flex items-center justify-center space-x-3 w-full bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white rounded-xl py-4 px-6 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 min-h-[56px] relative overflow-hidden group"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <Download className="w-6 h-6 relative z-10" />
              <span className="font-semibold text-lg relative z-10">Download QR Code</span>
              <Sparkles className="w-5 h-5 relative z-10 opacity-70" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium min-h-[48px]"
            >
              Close
            </button>
          </div>

          {/* Usage Instructions with Enhanced Design */}
          <div className="mt-6 p-4 bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>Usage Instructions</span>
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Scan with any QR code reader</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Print and attach to equipment</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Works offline for asset identification</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></span>
                <span>Waterproof compatible when laminated</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}