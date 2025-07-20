export type ConcreteWorkType = 
  | 'break_remove'
  | 'core_drill'
  | 'wall_saw'
  | 'slab_saw'
  | 'chain_saw'
  | 'ring_saw'
  | 'hand_saw'
  | 'chipping'
  | 'joint_sealing'
  | 'demolition';

export interface WorkTypeDetails {
  id: ConcreteWorkType;
  name: string;
  description: string;
  icon: string;
  category: 'drilling' | 'sawing' | 'breaking' | 'finishing';
  requiresDustSuppression: boolean;
  defaultEquipment: string[];
  calculationFactors: {
    materialDensity?: number; // kg/m³
    cuttingSpeed?: number; // m/min or mm/min
    bitWearRate?: number; // percentage per meter
    waterUsage?: number; // liters per minute
    powerRequirement?: number; // kW
  };
  safetyRequirements: string[];
}

export interface CuttingCalculation {
  volume: number; // m³
  duration: number; // minutes
  waterRequired: number; // liters
  equipmentWearPercentage: number;
  dustGenerated: number; // kg
  powerConsumption: number; // kWh
}

export interface EquipmentSuggestion {
  name: string;
  model: string;
  powerRating: number; // kW
  recommended: boolean;
  reason?: string;
}

export const CONCRETE_WORK_TYPES: Record<ConcreteWorkType, WorkTypeDetails> = {
  break_remove: {
    id: 'break_remove',
    name: 'Break & Remove',
    description: 'Breaking and removing concrete sections',
    icon: '🔨',
    category: 'breaking',
    requiresDustSuppression: true,
    defaultEquipment: ['Breaker', 'Jackhammer', 'Dust Vacuum'],
    calculationFactors: {
      materialDensity: 2400,
      powerRequirement: 1.5,
      waterUsage: 0
    },
    safetyRequirements: ['Hearing protection', 'Eye protection', 'Dust mask', 'Hard hat']
  },
  core_drill: {
    id: 'core_drill',
    name: 'Core Drill',
    description: 'Precision drilling for circular holes',
    icon: '⭕',
    category: 'drilling',
    requiresDustSuppression: true,
    defaultEquipment: ['Core Drill Rig', 'Diamond Core Bits', 'Water Supply'],
    calculationFactors: {
      materialDensity: 2400,
      cuttingSpeed: 25, // mm/min
      bitWearRate: 0.5,
      waterUsage: 3,
      powerRequirement: 2.2
    },
    safetyRequirements: ['Eye protection', 'Water management', 'Electrical safety']
  },
  wall_saw: {
    id: 'wall_saw',
    name: 'Wall Saw',
    description: 'Vertical and angled cuts in walls',
    icon: '🪚',
    category: 'sawing',
    requiresDustSuppression: true,
    defaultEquipment: ['Wall Saw System', 'Diamond Blade', 'Track System', 'Water Supply'],
    calculationFactors: {
      materialDensity: 2400,
      cuttingSpeed: 0.5, // m/min
      bitWearRate: 0.3,
      waterUsage: 8,
      powerRequirement: 15
    },
    safetyRequirements: ['Eye protection', 'Blade guard', 'Water management', 'Fall protection']
  },
  slab_saw: {
    id: 'slab_saw',
    name: 'Slab Saw',
    description: 'Horizontal cuts in floors and roads',
    icon: '🛤️',
    category: 'sawing',
    requiresDustSuppression: true,
    defaultEquipment: ['Floor Saw', 'Diamond Blade', 'Water Tank'],
    calculationFactors: {
      materialDensity: 2400,
      cuttingSpeed: 1.2, // m/min
      bitWearRate: 0.4,
      waterUsage: 12,
      powerRequirement: 35
    },
    safetyRequirements: ['Eye protection', 'Hearing protection', 'High-visibility clothing']
  },
  chain_saw: {
    id: 'chain_saw',
    name: 'Chain Saw',
    description: 'Deep cuts and corner cutting',
    icon: '🪵',
    category: 'sawing',
    requiresDustSuppression: true,
    defaultEquipment: ['Concrete Chain Saw', 'Diamond Chain', 'Water Supply'],
    calculationFactors: {
      materialDensity: 2400,
      cuttingSpeed: 0.3, // m/min
      bitWearRate: 0.6,
      waterUsage: 5,
      powerRequirement: 5
    },
    safetyRequirements: ['Eye protection', 'Cut-resistant clothing', 'Face shield']
  },
  ring_saw: {
    id: 'ring_saw',
    name: 'Ring Saw',
    description: 'Deep cuts up to 270mm without overcut',
    icon: '💍',
    category: 'sawing',
    requiresDustSuppression: true,
    defaultEquipment: ['Ring Saw', 'Diamond Ring Blade', 'Dust Attachment'],
    calculationFactors: {
      materialDensity: 2400,
      cuttingSpeed: 0.8, // m/min
      bitWearRate: 0.2,
      waterUsage: 2,
      powerRequirement: 2.5
    },
    safetyRequirements: ['Eye protection', 'Dust mask', 'Hearing protection']
  },
  hand_saw: {
    id: 'hand_saw',
    name: 'Hand Saw',
    description: 'Small cuts and detail work',
    icon: '🔪',
    category: 'sawing',
    requiresDustSuppression: true,
    defaultEquipment: ['Handheld Saw', 'Diamond Blade', 'Vacuum Attachment'],
    calculationFactors: {
      materialDensity: 2400,
      cuttingSpeed: 1.5, // m/min
      bitWearRate: 0.5,
      waterUsage: 0,
      powerRequirement: 2.4
    },
    safetyRequirements: ['Eye protection', 'Dust mask', 'Cut-resistant gloves']
  },
  chipping: {
    id: 'chipping',
    name: 'Chipping',
    description: 'Surface preparation and light demolition',
    icon: '⛏️',
    category: 'breaking',
    requiresDustSuppression: true,
    defaultEquipment: ['Chipping Hammer', 'Chisel Bits', 'Dust Vacuum'],
    calculationFactors: {
      materialDensity: 2400,
      powerRequirement: 1.2,
      waterUsage: 0
    },
    safetyRequirements: ['Eye protection', 'Dust mask', 'Vibration gloves']
  },
  joint_sealing: {
    id: 'joint_sealing',
    name: 'Joint Sealing',
    description: 'Sealing expansion and control joints',
    icon: '🔧',
    category: 'finishing',
    requiresDustSuppression: false,
    defaultEquipment: ['Joint Cleaning Tools', 'Backer Rod', 'Sealant Gun'],
    calculationFactors: {
      materialDensity: 0,
      powerRequirement: 0
    },
    safetyRequirements: ['Chemical-resistant gloves', 'Knee pads']
  },
  demolition: {
    id: 'demolition',
    name: 'Demolition',
    description: 'Complete structure removal',
    icon: '💥',
    category: 'breaking',
    requiresDustSuppression: true,
    defaultEquipment: ['Demolition Robot', 'Breaker', 'Crusher', 'Water Cannon'],
    calculationFactors: {
      materialDensity: 2400,
      powerRequirement: 20,
      waterUsage: 15
    },
    safetyRequirements: ['Hard hat', 'Safety vest', 'Steel-toe boots', 'Exclusion zone']
  }
};

export function calculateCutting(
  workType: ConcreteWorkType,
  dimensions: { length: number; depth: number; width?: number }
): CuttingCalculation {
  const workDetails = CONCRETE_WORK_TYPES[workType];
  const factors = workDetails.calculationFactors;
  
  // Calculate volume
  const volume = dimensions.width 
    ? (dimensions.length * dimensions.depth * dimensions.width) / 1000000 // m³
    : (dimensions.length * dimensions.depth) / 1000000; // m² for surface area
  
  // Calculate duration based on cutting speed
  const cuttingSpeed = factors.cuttingSpeed || 1;
  const duration = (dimensions.length / 1000) / (cuttingSpeed / 60); // minutes
  
  // Calculate water required
  const waterRequired = (factors.waterUsage || 0) * duration;
  
  // Calculate equipment wear
  const equipmentWearPercentage = (factors.bitWearRate || 0) * (dimensions.length / 1000);
  
  // Calculate dust generated (if no water suppression)
  const dustGenerated = factors.waterUsage === 0 
    ? volume * (factors.materialDensity || 2400) * 0.001 // 0.1% becomes dust
    : 0;
  
  // Calculate power consumption
  const powerConsumption = (factors.powerRequirement || 0) * (duration / 60); // kWh
  
  return {
    volume,
    duration: Math.round(duration),
    waterRequired: Math.round(waterRequired),
    equipmentWearPercentage: Math.round(equipmentWearPercentage * 10) / 10,
    dustGenerated: Math.round(dustGenerated * 10) / 10,
    powerConsumption: Math.round(powerConsumption * 10) / 10
  };
}

export function suggestEquipment(
  workType: ConcreteWorkType,
  jobSize: 'small' | 'medium' | 'large'
): EquipmentSuggestion[] {
  const suggestions: EquipmentSuggestion[] = [];
  
  switch (workType) {
    case 'core_drill':
      if (jobSize === 'small') {
        suggestions.push({
          name: 'DD 150-U',
          model: 'Hilti',
          powerRating: 1.9,
          recommended: true,
          reason: 'Perfect for holes up to 162mm'
        });
      } else if (jobSize === 'medium') {
        suggestions.push({
          name: 'DD 350-CA',
          model: 'Hilti',
          powerRating: 3.3,
          recommended: true,
          reason: 'High-performance for holes up to 500mm'
        });
      } else {
        suggestions.push({
          name: 'DD 500-CA',
          model: 'Hilti',
          powerRating: 5.0,
          recommended: true,
          reason: 'Heavy-duty for large diameter drilling'
        });
      }
      break;
      
    case 'wall_saw':
      if (jobSize === 'small') {
        suggestions.push({
          name: 'DST 10-CA',
          model: 'Hilti',
          powerRating: 11,
          recommended: true,
          reason: 'Compact system for depths up to 530mm'
        });
      } else {
        suggestions.push({
          name: 'DST 20-CA',
          model: 'Hilti',
          powerRating: 19,
          recommended: true,
          reason: 'Professional system for depths up to 730mm'
        });
      }
      break;
      
    case 'slab_saw':
      if (jobSize === 'small') {
        suggestions.push({
          name: 'DSH 700-X',
          model: 'Hilti',
          powerRating: 3.5,
          recommended: true,
          reason: 'Handheld for cuts up to 125mm'
        });
      } else if (jobSize === 'medium') {
        suggestions.push({
          name: 'DSH 900-X',
          model: 'Hilti',
          powerRating: 4.8,
          recommended: true,
          reason: 'Powerful for cuts up to 150mm'
        });
      } else {
        suggestions.push({
          name: 'FS 500',
          model: 'Husqvarna',
          powerRating: 35,
          recommended: true,
          reason: 'Self-propelled for large floor areas'
        });
      }
      break;
      
    default:
      // Add generic suggestions based on work type
      const workDetails = CONCRETE_WORK_TYPES[workType];
      workDetails.defaultEquipment.forEach((equipment, index) => {
        suggestions.push({
          name: equipment,
          model: 'Various',
          powerRating: workDetails.calculationFactors.powerRequirement || 0,
          recommended: index === 0
        });
      });
  }
  
  return suggestions;
}

export function getDustSuppressionRequirements(workType: ConcreteWorkType): string[] {
  const workDetails = CONCRETE_WORK_TYPES[workType];
  
  if (!workDetails.requiresDustSuppression) {
    return [];
  }
  
  const requirements: string[] = [];
  
  if (workDetails.calculationFactors.waterUsage && workDetails.calculationFactors.waterUsage > 0) {
    requirements.push(`Water supply: ${workDetails.calculationFactors.waterUsage}L/min minimum`);
    requirements.push('Water collection system');
    requirements.push('Slurry disposal plan');
  } else {
    requirements.push('HEPA vacuum attachment');
    requirements.push('Dust collection bags');
    requirements.push('Air monitoring equipment');
  }
  
  requirements.push('PPE: N95/P100 respirators');
  requirements.push('Containment barriers if indoors');
  requirements.push('Warning signs for dust hazard area');
  
  return requirements;
}