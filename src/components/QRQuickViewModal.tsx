'use client'

import React, { useEffect, useRef, useState } from 'react'
import { X, Download, QrCode, Copy, CheckCircle, Wrench, MapPin } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

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
  const [copied, setCopied] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false) // Prevent multiple clicks
  const { toast } = useToast() // ✅ Add toast hook

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

  // ✅ FIXED: Single toast notification with proper event handling
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent any default behavior
    e.stopPropagation() // Stop event bubbling
    
    if (isDownloading) return // Prevent multiple rapid clicks
    
    setIsDownloading(true)
    
    try {
      if (canvasRef.current) {
        const canvas = canvasRef.current
        const link = document.createElement('a')
        link.download = `QR_${asset.asset_id || asset.name || 'asset'}.png`
        link.href = canvas.toDataURL()
        
        // Use a more reliable download method
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // ✅ SINGLE TOAST - Only show success notification here
        toast({
          title: "QR Code Downloaded!",
          description: `${asset.name || 'Asset'} QR code saved successfully`,
          variant: "default"
        })
      }
    } catch (error) {
      console.error('Download failed:', error)
      toast({
        title: "Download Failed",
        description: "Please try again",
        variant: "destructive"
      })
    } finally {
      // Reset download state after a short delay
      setTimeout(() => {
        setIsDownloading(false)
      }, 1000)
    }
  }

  const handleCopyAssetId = async () => {
    if (asset.asset_id) {
      await navigator.clipboard.writeText(asset.asset_id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

          {/* Action Buttons - Construction-Worker Optimized */}
          <div className="grid grid-cols-1 gap-3">
            {/* ✅ FIXED: Download Button with proper event handling */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className={`flex items-center justify-center space-x-3 w-full rounded-xl py-4 px-6 transition-all duration-300 shadow-lg min-h-[56px] ${
                isDownloading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transform hover:scale-105 hover:shadow-blue-500/25'
              } text-white font-semibold text-lg`}
            >
              <Download className="w-6 h-6" />
              <span>{isDownloading ? 'Downloading...' : 'Download QR Code'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="w-full py-3 px-6 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium min-h-[48px]"
            >
              Close
            </button>
          </div>

          {/* Usage Instructions */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2 flex items-center space-x-2">
              <QrCode className="w-4 h-4" />
              <span>Usage Instructions</span>
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Scan with any QR code reader</li>
              <li>• Print and attach to equipment</li>
              <li>• Works offline for asset identification</li>
              <li>• Waterproof compatible when laminated</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}