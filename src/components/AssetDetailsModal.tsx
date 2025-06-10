// src/components/AssetDetailsModal.tsx - UPDATED WITH BULK OPERATIONS DESIGN
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { 
  X, 
  Edit, 
  Save, 
  Download, 
  MapPin, 
  Calendar, 
  User, 
  Tag,
  Wrench,
  CheckCircle,
  AlertTriangle,
  Circle,
  Clock,
  Users,
  Truck,
  Building
} from 'lucide-react';

// ===== INTERFACE DEFINITIONS (TOP LEVEL) =====
interface Asset {
  id: string;
  name: string;
  category: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
  location: string | { name: string };
  qr_code: string;
  serial_number?: string;
  brand?: string;
  model?: string;
  description?: string;
  assigned_to?: string | { name: string };
  purchase_date?: string;
  last_updated?: string;
  created_at?: string;
}

interface Operator {
  id: string;
  name: string;
  email?: string;
  role?: string;
}

interface AssetDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: Asset;
  onAssetUpdated: () => void;
}

// ===== COMPONENT IMPLEMENTATION =====
const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({
  isOpen,
  onClose,
  asset,
  onAssetUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editedAsset, setEditedAsset] = useState<Asset>(asset);
  const [operators, setOperators] = useState<Operator[]>([]);
  const [trucks, setTrucks] = useState<Array<{id: string, name: string}>>([]);
  
  // Assignment type state (matching BulkOperations)
  const [assignmentType, setAssignmentType] = useState<'operator' | 'truck' | 'west_shop' | 'east_shop' | 'other' | null>(null);
  const [customLocation, setCustomLocation] = useState('');
  
  const { toast } = useToast();

  // Helper function to safely extract string values from potential objects
  const getStringValue = (value: string | { name: string } | undefined): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value.name) return value.name;
    return '';
  };

  // Status configuration
  const statusConfig = {
    available: { 
      icon: CheckCircle, 
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-200',
      label: 'Available'
    },
    in_use: { 
      icon: Circle, 
      color: 'text-orange-600', 
      bg: 'bg-orange-50', 
      border: 'border-orange-200',
      label: 'In Use'
    },
    maintenance: { 
      icon: AlertTriangle, 
      color: 'text-red-600', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      label: 'Maintenance'
    },
    offline: { 
      icon: Circle, 
      color: 'text-gray-600', 
      bg: 'bg-gray-50', 
      border: 'border-gray-200',
      label: 'Offline'
    }
  };

  // Load data on component mount
  useEffect(() => {
    if (isOpen) {
      loadOperators();
      loadTrucks();
    }
    setEditedAsset(asset);
  }, [asset, isOpen]);

  // Determine assignment type when operators/trucks are loaded
  useEffect(() => {
    if (operators.length > 0 && trucks.length > 0) {
      const currentAssignment = getStringValue(asset.assigned_to);
      if (currentAssignment === 'West Side Shop') {
        setAssignmentType('west_shop');
      } else if (currentAssignment === 'East Side Shop') {
        setAssignmentType('east_shop');
      } else if (trucks.some(truck => truck.name === currentAssignment)) {
        setAssignmentType('truck');
      } else if (operators.some(op => op.name === currentAssignment)) {
        setAssignmentType('operator');
      } else if (currentAssignment && currentAssignment !== 'Unassigned') {
        setAssignmentType('other');
        setCustomLocation(currentAssignment);
      }
    }
  }, [asset.assigned_to, operators, trucks]);

  const loadOperators = async () => {
    // Real Pontifex Industries operators for authentic demo
    setOperators([
      { id: 'user1', name: 'Andres Altamirano', role: 'Operator' },
      { id: 'user2', name: 'Skinny', role: 'Operator' },
      { id: 'user3', name: 'Leo Hernandez', role: 'Operator' },
      { id: 'user4', name: 'Wynn Duncan', role: 'Operator' },
      { id: 'user5', name: 'Rex Zaragoza', role: 'Operator' },
      { id: 'user6', name: 'Brandon Ruiz', role: 'Operator' },
      { id: 'user7', name: 'Lonnie Duncan', role: 'Operator' },
      { id: 'user8', name: 'Gabriel Mora', role: 'Operator' },
      { id: 'unassigned', name: 'Unassigned', role: 'Equipment Pool' }
    ]);
  };

  const loadTrucks = async () => {
    // Pontifex Industries fleet trucks
    setTrucks([
      { id: 'truck001', name: 'Truck 001' },
      { id: 'truck002', name: 'Truck 002' },
      { id: 'truck003', name: 'Truck 003' },
      { id: 'truck004', name: 'Truck 004' },
      { id: 'truck005', name: 'Truck 005' },
      { id: 'truck006', name: 'Truck 006' },
      { id: 'truck007', name: 'Truck 007' },
      { id: 'truck008', name: 'Truck 008' },
      { id: 'truck009', name: 'Truck 009' },
      { id: 'truck010', name: 'Truck 010' }
    ]);
  };

const handleSave = async () => {
  setLoading(true);
  try {
    let finalAssignedTo = null;
    let finalAssignedType = null;
    
    switch (assignmentType) {
      case 'west_shop':
        finalAssignedTo = null; // No UUID for shops
        finalAssignedType = 'shop';
        break;
      case 'east_shop':
        finalAssignedTo = null; // No UUID for shops  
        finalAssignedType = 'shop';
        break;
      case 'other':
        finalAssignedTo = null; // No UUID for custom locations
        finalAssignedType = 'other';
        break;
      case 'operator':
        // Find the operator's UUID from the operators list
        const selectedOperator = operators.find(op => op.name === getStringValue(editedAsset.assigned_to));
        finalAssignedTo = selectedOperator ? selectedOperator.id : null;
        finalAssignedType = 'operator';
        break;
      case 'truck':
        // Find the truck's UUID from the trucks list  
        const selectedTruck = trucks.find(truck => truck.name === getStringValue(editedAsset.assigned_to));
        finalAssignedTo = selectedTruck ? selectedTruck.id : null;
        finalAssignedType = 'truck';
        break;
      default:
        finalAssignedTo = null;
        finalAssignedType = null;
    }

    console.log('Updating with:', { 
      name: editedAsset.name,
      category: editedAsset.category, 
      status: editedAsset.status,
      assigned_to: finalAssignedTo,
      assigned_type: finalAssignedType
    });

    const { data, error } = await supabase
      .from('assets')
      .update({
        name: editedAsset.name,
        category: editedAsset.category,
        status: editedAsset.status,
        assigned_to: finalAssignedTo,
        assigned_type: finalAssignedType,
        last_updated: new Date().toISOString()
      })
      .eq('id', asset.id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Success:', data);
    toast({ title: "Success", description: "Asset updated successfully" });
    setIsEditing(false);
    onAssetUpdated();
    
  } catch (error) {
    console.error('Error updating asset:', error);
    toast({ title: "Error", description: "Failed to update asset", variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

  const downloadQRCode = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 200;
    canvas.height = 200;

    // Fill white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);

    // Add simple QR placeholder
    ctx.fillStyle = '#000000';
    ctx.fillRect(20, 20, 160, 160);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(40, 40, 120, 120);
    
    // Add asset info
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(asset.name, 100, 190);

    // Download
    const link = document.createElement('a');
    link.download = `${asset.name}-qr-code.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({ title: "Success", description: "QR code downloaded" });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString();
  };

  const statusInfo = statusConfig[asset.status];
  const StatusIcon = statusInfo.icon;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overscroll-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl sm:max-h-[90vh] bg-white dark:bg-slate-800 sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-screen">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              {/* Asset Icon */}
              <div className={`w-12 h-12 sm:w-16 sm:h-16 ${statusInfo.bg} ${statusInfo.border} border-2 rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Wrench className={`w-6 h-6 sm:w-8 sm:h-8 ${statusInfo.color}`} />
              </div>
              
              {/* Asset Title */}
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                  {asset.name || 'Unnamed Asset'}
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
                  #{asset.serial_number || asset.id.slice(0, 8)}
                </p>
                {/* Status Badge */}
                <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full ${statusInfo.bg} ${statusInfo.border} border mt-2`}>
                  <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                  <span className={`text-sm font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 flex-shrink-0 ml-4">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 sm:p-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Save changes"
                >
                  <Save className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Edit asset"
                >
                  <Edit className="w-5 h-5" />
                </button>
              )}
              
              <button
                onClick={onClose}
                className="p-2 sm:p-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-400 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6 space-y-6 sm:space-y-8">
          
          {/* Basic Information */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
              Equipment Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="asset-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                {isEditing ? (
                  <input
                    id="asset-name"
                    type="text"
                    value={editedAsset.name}
                    onChange={(e) => setEditedAsset({...editedAsset, name: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="Enter asset name"
                  />
                ) : (
                  <p className="text-base sm:text-lg font-medium text-slate-900 dark:text-white py-3">
                    {asset.name || 'Not specified'}
                  </p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="asset-category" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Category
                </label>
                {isEditing ? (
                  <select
                    id="asset-category"
                    value={editedAsset.category}
                    onChange={(e) => setEditedAsset({...editedAsset, category: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  >
                    <option value="Core Drilling">Core Drilling</option>
                    <option value="Cutting Tools">Cutting Tools</option>
                    <option value="Safety Equipment">Safety Equipment</option>
                    <option value="Power Tools">Power Tools</option>
                    <option value="Hand Tools">Hand Tools</option>
                    <option value="Measuring">Measuring</option>
                  </select>
                ) : (
                  <div className="flex items-center space-x-2 py-3">
                    <Tag className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-white">
                      {asset.category || 'Not specified'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label htmlFor="asset-status" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Status
              </label>
              {isEditing ? (
                <select
                  id="asset-status"
                  value={editedAsset.status}
                  onChange={(e) => setEditedAsset({...editedAsset, status: e.target.value as Asset['status']})}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                >
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="offline">Offline</option>
                </select>
              ) : (
                <div className={`inline-flex items-center space-x-3 px-4 py-3 rounded-xl ${statusInfo.bg} ${statusInfo.border} border`}>
                  <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                  <span className={`text-base font-medium ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location & Assignment - BulkOperations Style */}
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
              Location & Assignment
            </h3>
            
            {isEditing ? (
              <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
                <h4 className="font-semibold mb-3">Assignment Options</h4>
                
                {/* Assignment Type Selection - Matching BulkOperations */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign To:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignmentType('operator')}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        assignmentType === 'operator'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <Users className="w-4 h-4 mx-auto mb-1" />
                      Operator
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentType('truck')}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        assignmentType === 'truck'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <Truck className="w-4 h-4 mx-auto mb-1" />
                      Truck
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentType('west_shop')}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        assignmentType === 'west_shop'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <Building className="w-4 h-4 mx-auto mb-1" />
                      West Shop
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentType('east_shop')}
                      className={`p-3 rounded-lg border transition-all text-sm ${
                        assignmentType === 'east_shop'
                          ? 'border-blue-500 bg-blue-100 text-blue-700'
                          : 'border-gray-300 hover:border-blue-300'
                      }`}
                    >
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      East Shop
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setAssignmentType('other')}
                    className={`w-full mt-2 p-3 rounded-lg border transition-all text-sm ${
                      assignmentType === 'other'
                        ? 'border-blue-500 bg-blue-100 text-blue-700'
                        : 'border-gray-300 hover:border-blue-300'
                    }`}
                  >
                    Other Location
                  </button>
                </div>

                {/* Specific Assignment Selection */}
                {assignmentType === 'operator' && (
                  <select
                    value={getStringValue(editedAsset.assigned_to)}
                    onChange={(e) => setEditedAsset({...editedAsset, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Operator</option>
                    {operators.map(operator => (
                      <option key={operator.id} value={operator.name}>
                        {operator.name} {operator.role && `(${operator.role})`}
                      </option>
                    ))}
                  </select>
                )}

                {assignmentType === 'truck' && (
                  <select
                    value={getStringValue(editedAsset.assigned_to)}
                    onChange={(e) => setEditedAsset({...editedAsset, assigned_to: e.target.value})}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Truck</option>
                    {trucks.map(truck => (
                      <option key={truck.id} value={truck.name}>
                        {truck.name}
                      </option>
                    ))}
                  </select>
                )}

                {assignmentType === 'other' && (
                  <div>
                    <input
                      type="text"
                      value={customLocation}
                      onChange={(e) => setCustomLocation(e.target.value)}
                      placeholder="Enter custom location (e.g., 'ABC Repair Shop', 'Site C Storage')"
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      Use for mechanic shops, temporary storage, or off-site locations
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {/* Current Location Display */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Location
                  </label>
                  <div className="flex items-center space-x-2 py-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-white">
                      {getStringValue(asset.location) || 'Not specified'}
                    </span>
                  </div>
                </div>

                {/* Current Assignment Display */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Assigned To
                  </label>
                  <div className="flex items-center space-x-2 py-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-base text-slate-900 dark:text-white">
                      {getStringValue(asset.assigned_to) || 'Unassigned'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
              Description
            </h3>
            
            <div className="space-y-2">
              <label htmlFor="asset-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Additional Notes
              </label>
              {isEditing ? (
                <textarea
                  id="asset-description"
                  value={editedAsset.description || ''}
                  onChange={(e) => setEditedAsset({...editedAsset, description: e.target.value})}
                  rows={4}
                  className="w-full px-4 py-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                  placeholder="Enter description or notes..."
                />
              ) : (
                <p className="text-base text-slate-700 dark:text-slate-300 py-3 bg-slate-50 dark:bg-slate-700 rounded-xl px-4 min-h-[120px]">
                  {asset.description || 'No description provided'}
                </p>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div className="space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-3">
              History
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Created Date
                </label>
                <div className="flex items-center space-x-2 py-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-white">
                    {formatDate(asset.created_at)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Last Updated
                </label>
                <div className="flex items-center space-x-2 py-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-base text-slate-900 dark:text-white">
                    {formatDate(asset.last_updated)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0 sm:space-x-4">
            
            {/* QR Code Section */}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center border border-slate-200 dark:border-slate-600">
                <div className="w-8 h-8 bg-black rounded-sm"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">QR Code</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">Quick asset identification</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={downloadQRCode}
                className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors min-h-[48px]"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </button>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl font-medium transition-colors min-h-[48px]"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Asset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsModal; 