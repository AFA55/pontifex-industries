export interface WorkType {
  id: string;
  name: string;
  description: string;
  category: WorkCategory;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  defaultDurationHours: number;
  skillRequirements: string[];
  requiresPermit: boolean;
  beaconEquipmentTriggers?: string[]; // Equipment types that suggest this work type
}

export type WorkCategory = 
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'structural'
  | 'concrete'
  | 'roofing'
  | 'flooring'
  | 'painting'
  | 'demolition'
  | 'excavation'
  | 'welding'
  | 'carpentry'
  | 'masonry'
  | 'insulation'
  | 'drywall'
  | 'safety'
  | 'inspection'
  | 'maintenance'
  | 'landscaping'
  | 'equipment';

export const DSM_WORK_TYPES: WorkType[] = [
  // Electrical
  {
    id: 'electrical-installation',
    name: 'Electrical Installation',
    description: 'Install electrical systems, wiring, and components',
    category: 'electrical',
    icon: 'Zap',
    color: 'yellow',
    riskLevel: 'high',
    defaultDurationHours: 8,
    skillRequirements: ['electrical_license', 'safety_training'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['multimeter', 'wire_stripper', 'voltage_tester']
  },
  {
    id: 'electrical-repair',
    name: 'Electrical Repair',
    description: 'Troubleshoot and repair electrical issues',
    category: 'electrical',
    icon: 'ZapOff',
    color: 'yellow',
    riskLevel: 'high',
    defaultDurationHours: 4,
    skillRequirements: ['electrical_license'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['multimeter', 'circuit_tester']
  },
  
  // Plumbing
  {
    id: 'plumbing-installation',
    name: 'Plumbing Installation',
    description: 'Install pipes, fixtures, and plumbing systems',
    category: 'plumbing',
    icon: 'Droplet',
    color: 'blue',
    riskLevel: 'medium',
    defaultDurationHours: 6,
    skillRequirements: ['plumbing_license'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['pipe_wrench', 'plunger', 'pipe_cutter']
  },
  {
    id: 'plumbing-repair',
    name: 'Plumbing Repair',
    description: 'Fix leaks, clogs, and plumbing issues',
    category: 'plumbing',
    icon: 'Wrench',
    color: 'blue',
    riskLevel: 'medium',
    defaultDurationHours: 3,
    skillRequirements: ['plumbing_license'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['pipe_wrench', 'leak_detector']
  },
  
  // HVAC
  {
    id: 'hvac-installation',
    name: 'HVAC Installation',
    description: 'Install heating, ventilation, and air conditioning systems',
    category: 'hvac',
    icon: 'Wind',
    color: 'cyan',
    riskLevel: 'medium',
    defaultDurationHours: 10,
    skillRequirements: ['hvac_certification'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['refrigerant_gauge', 'duct_tool']
  },
  {
    id: 'hvac-maintenance',
    name: 'HVAC Maintenance',
    description: 'Service and maintain HVAC systems',
    category: 'hvac',
    icon: 'Fan',
    color: 'cyan',
    riskLevel: 'low',
    defaultDurationHours: 2,
    skillRequirements: ['hvac_certification'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['refrigerant_gauge', 'thermometer']
  },
  
  // Structural
  {
    id: 'framing',
    name: 'Framing',
    description: 'Build structural framework and supports',
    category: 'structural',
    icon: 'Frame',
    color: 'orange',
    riskLevel: 'medium',
    defaultDurationHours: 8,
    skillRequirements: ['carpentry_cert'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['nail_gun', 'circular_saw', 'level']
  },
  {
    id: 'steel-erection',
    name: 'Steel Erection',
    description: 'Install structural steel beams and supports',
    category: 'structural',
    icon: 'Construction',
    color: 'gray',
    riskLevel: 'critical',
    defaultDurationHours: 12,
    skillRequirements: ['steel_worker_cert', 'rigging_cert'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['welding_machine', 'crane_remote']
  },
  
  // Concrete
  {
    id: 'concrete-pouring',
    name: 'Concrete Pouring',
    description: 'Pour and finish concrete structures',
    category: 'concrete',
    icon: 'Package',
    color: 'stone',
    riskLevel: 'medium',
    defaultDurationHours: 6,
    skillRequirements: ['concrete_finishing'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['concrete_mixer', 'trowel', 'float']
  },
  {
    id: 'foundation-work',
    name: 'Foundation Work',
    description: 'Prepare and pour building foundations',
    category: 'concrete',
    icon: 'Home',
    color: 'stone',
    riskLevel: 'high',
    defaultDurationHours: 10,
    skillRequirements: ['concrete_cert', 'excavation_cert'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['concrete_pump', 'rebar_cutter']
  },
  
  // Roofing
  {
    id: 'roof-installation',
    name: 'Roof Installation',
    description: 'Install new roofing materials and systems',
    category: 'roofing',
    icon: 'Umbrella',
    color: 'red',
    riskLevel: 'high',
    defaultDurationHours: 8,
    skillRequirements: ['roofing_cert', 'fall_protection'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['nail_gun', 'shingle_cutter']
  },
  {
    id: 'roof-repair',
    name: 'Roof Repair',
    description: 'Repair damaged roofing and fix leaks',
    category: 'roofing',
    icon: 'CloudRain',
    color: 'red',
    riskLevel: 'high',
    defaultDurationHours: 4,
    skillRequirements: ['roofing_cert', 'fall_protection'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['roofing_hammer', 'tar_applicator']
  },
  
  // Flooring
  {
    id: 'floor-installation',
    name: 'Floor Installation',
    description: 'Install hardwood, tile, carpet, or vinyl flooring',
    category: 'flooring',
    icon: 'Square',
    color: 'amber',
    riskLevel: 'low',
    defaultDurationHours: 6,
    skillRequirements: ['flooring_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['tile_cutter', 'floor_nailer']
  },
  {
    id: 'floor-refinishing',
    name: 'Floor Refinishing',
    description: 'Sand and refinish existing floors',
    category: 'flooring',
    icon: 'Paintbrush',
    color: 'amber',
    riskLevel: 'low',
    defaultDurationHours: 8,
    skillRequirements: ['flooring_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['floor_sander', 'buffer']
  },
  
  // Painting
  {
    id: 'interior-painting',
    name: 'Interior Painting',
    description: 'Paint interior walls, ceilings, and trim',
    category: 'painting',
    icon: 'Palette',
    color: 'purple',
    riskLevel: 'low',
    defaultDurationHours: 6,
    skillRequirements: [],
    requiresPermit: false,
    beaconEquipmentTriggers: ['paint_sprayer', 'roller_extension']
  },
  {
    id: 'exterior-painting',
    name: 'Exterior Painting',
    description: 'Paint building exteriors and structures',
    category: 'painting',
    icon: 'Brush',
    color: 'purple',
    riskLevel: 'medium',
    defaultDurationHours: 8,
    skillRequirements: ['ladder_safety'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['paint_sprayer', 'pressure_washer']
  },
  
  // Demolition
  {
    id: 'selective-demolition',
    name: 'Selective Demolition',
    description: 'Remove specific building components',
    category: 'demolition',
    icon: 'Hammer',
    color: 'red',
    riskLevel: 'high',
    defaultDurationHours: 8,
    skillRequirements: ['demolition_cert', 'asbestos_awareness'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['demolition_hammer', 'reciprocating_saw']
  },
  {
    id: 'full-demolition',
    name: 'Full Demolition',
    description: 'Complete building or structure demolition',
    category: 'demolition',
    icon: 'Bomb',
    color: 'red',
    riskLevel: 'critical',
    defaultDurationHours: 16,
    skillRequirements: ['demolition_cert', 'heavy_equipment'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['excavator', 'wrecking_ball']
  },
  
  // Excavation
  {
    id: 'site-excavation',
    name: 'Site Excavation',
    description: 'Excavate for foundations and utilities',
    category: 'excavation',
    icon: 'Mountain',
    color: 'brown',
    riskLevel: 'high',
    defaultDurationHours: 10,
    skillRequirements: ['excavation_cert', 'heavy_equipment'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['excavator', 'backhoe']
  },
  {
    id: 'trenching',
    name: 'Trenching',
    description: 'Dig trenches for utilities and drainage',
    category: 'excavation',
    icon: 'GitBranch',
    color: 'brown',
    riskLevel: 'high',
    defaultDurationHours: 6,
    skillRequirements: ['trench_safety', 'confined_space'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['trencher', 'shoring_equipment']
  },
  
  // Welding
  {
    id: 'structural-welding',
    name: 'Structural Welding',
    description: 'Weld structural steel and metal components',
    category: 'welding',
    icon: 'Flame',
    color: 'orange',
    riskLevel: 'high',
    defaultDurationHours: 8,
    skillRequirements: ['welding_cert', 'hot_work_permit'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['welding_machine', 'welding_helmet']
  },
  {
    id: 'pipe-welding',
    name: 'Pipe Welding',
    description: 'Weld pipes for plumbing and industrial systems',
    category: 'welding',
    icon: 'Cylinder',
    color: 'orange',
    riskLevel: 'high',
    defaultDurationHours: 6,
    skillRequirements: ['pipe_welding_cert', 'hot_work_permit'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['tig_welder', 'pipe_clamp']
  },
  
  // Carpentry
  {
    id: 'rough-carpentry',
    name: 'Rough Carpentry',
    description: 'Build structural frames and rough openings',
    category: 'carpentry',
    icon: 'Axe',
    color: 'amber',
    riskLevel: 'medium',
    defaultDurationHours: 8,
    skillRequirements: ['carpentry_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['circular_saw', 'framing_nailer']
  },
  {
    id: 'finish-carpentry',
    name: 'Finish Carpentry',
    description: 'Install trim, cabinets, and finish work',
    category: 'carpentry',
    icon: 'Ruler',
    color: 'amber',
    riskLevel: 'low',
    defaultDurationHours: 6,
    skillRequirements: ['carpentry_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['miter_saw', 'finish_nailer']
  },
  
  // Safety & Inspection
  {
    id: 'safety-inspection',
    name: 'Safety Inspection',
    description: 'Conduct safety audits and inspections',
    category: 'safety',
    icon: 'Shield',
    color: 'green',
    riskLevel: 'low',
    defaultDurationHours: 2,
    skillRequirements: ['safety_officer_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['gas_detector', 'safety_meter']
  },
  {
    id: 'quality-inspection',
    name: 'Quality Inspection',
    description: 'Inspect work quality and compliance',
    category: 'inspection',
    icon: 'Search',
    color: 'blue',
    riskLevel: 'low',
    defaultDurationHours: 3,
    skillRequirements: ['inspector_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['laser_measure', 'inspection_camera']
  },
  
  // Equipment Operation
  {
    id: 'crane-operation',
    name: 'Crane Operation',
    description: 'Operate cranes for lifting and moving materials',
    category: 'equipment',
    icon: 'Truck',
    color: 'yellow',
    riskLevel: 'critical',
    defaultDurationHours: 8,
    skillRequirements: ['crane_operator_cert', 'rigging_cert'],
    requiresPermit: true,
    beaconEquipmentTriggers: ['crane_remote', 'load_monitor']
  },
  {
    id: 'forklift-operation',
    name: 'Forklift Operation',
    description: 'Operate forklifts for material handling',
    category: 'equipment',
    icon: 'Package2',
    color: 'yellow',
    riskLevel: 'medium',
    defaultDurationHours: 8,
    skillRequirements: ['forklift_cert'],
    requiresPermit: false,
    beaconEquipmentTriggers: ['forklift_key', 'pallet_jack']
  }
];

// Helper function to get work types by equipment detected
export function getWorkTypesByEquipment(detectedEquipment: string[]): WorkType[] {
  return DSM_WORK_TYPES.filter(workType => 
    workType.beaconEquipmentTriggers?.some(trigger => 
      detectedEquipment.some(equipment => 
        equipment.toLowerCase().includes(trigger.toLowerCase()) ||
        trigger.toLowerCase().includes(equipment.toLowerCase())
      )
    )
  );
}

// Helper function to get work types by category
export function getWorkTypesByCategory(category: WorkCategory): WorkType[] {
  return DSM_WORK_TYPES.filter(workType => workType.category === category);
}

// Helper function to search work types
export function searchWorkTypes(query: string): WorkType[] {
  const lowercaseQuery = query.toLowerCase();
  return DSM_WORK_TYPES.filter(workType => 
    workType.name.toLowerCase().includes(lowercaseQuery) ||
    workType.description.toLowerCase().includes(lowercaseQuery) ||
    workType.category.toLowerCase().includes(lowercaseQuery) ||
    workType.skillRequirements.some(skill => skill.toLowerCase().includes(lowercaseQuery))
  );
}