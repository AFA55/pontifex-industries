/**
 * Sample Data for Sales Demonstrations
 * Comprehensive concrete cutting company data showcasing Pontifex advantages
 */

import { 
  SalesDemoData, 
  DemoCompany, 
  DemoJob, 
  DemoEquipment, 
  DemoEmployee, 
  DemoCustomer,
  RealTimeDemo,
  BusinessMetrics,
  DSMComparison,
  DemoScenario,
  ConcreteService,
  JobStatus,
  EquipmentType,
  EmployeeRole
} from '@/types/sales-demo';

export const DEMO_COMPANY: DemoCompany = {
  id: 'precision-concrete-cutting',
  name: 'Precision Concrete Cutting LLC',
  type: 'concrete_cutting',
  location: {
    address: '2847 Industrial Parkway',
    city: 'Charlotte',
    state: 'NC',
    zipCode: '28208',
    coordinates: { lat: 35.2271, lng: -80.8431 }
  },
  established: 2018,
  employees: 24,
  annualRevenue: 3200000,
  serviceAreas: ['Charlotte Metro', 'Research Triangle', 'Triad Region'],
  specialties: ['core_drilling', 'wall_sawing', 'slab_sawing', 'wire_sawing'],
  equipment: {
    coredrills: 8,
    wallsaws: 6,
    slabsaws: 4,
    wiresaws: 2,
    vehicles: 12
  },
  currentChallenges: [
    'Equipment tracking and utilization',
    'OSHA silica compliance documentation',
    'Real-time job progress visibility',
    'Customer communication automation',
    'Preventive maintenance scheduling'
  ],
  goals: [
    'Increase equipment utilization by 20%',
    'Achieve 100% OSHA compliance',
    'Reduce customer complaints by 50%',
    'Improve profit margins by 15%',
    'Expand into new markets'
  ]
};

export const DEMO_CUSTOMERS: DemoCustomer[] = [
  {
    id: 'atlantic-construction',
    name: 'Atlantic Construction Group',
    type: 'general_contractor',
    primaryContact: {
      name: 'Mike Rodriguez',
      title: 'Project Manager',
      email: 'mrodriguez@atlanticgroup.com',
      phone: '(704) 555-0123'
    },
    address: {
      address: '1455 South Blvd',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28203',
      coordinates: { lat: 35.2089, lng: -80.8618 }
    },
    website: 'www.atlanticgroup.com',
    industry: 'Commercial Construction',
    totalJobs: 47,
    totalRevenue: 580000,
    averageJobValue: 12340,
    paymentTerms: 30,
    creditRating: 'A',
    satisfactionScore: 4.7,
    referrals: 8,
    complaints: 1,
    recentJobs: ['job-001', 'job-003', 'job-008'],
    preferredServices: ['core_drilling', 'wall_sawing'],
    communicationPreferences: {
      jobUpdates: true,
      arrivalNotifications: true,
      completionAlerts: true,
      invoiceDelivery: 'email'
    }
  },
  {
    id: 'carolina-developers',
    name: 'Carolina Property Developers',
    type: 'developer',
    primaryContact: {
      name: 'Sarah Chen',
      title: 'Development Manager',
      email: 'schen@carolinadev.com',
      phone: '(704) 555-0156'
    },
    address: {
      address: '500 South Tryon Street',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      coordinates: { lat: 35.2220, lng: -80.8414 }
    },
    website: 'www.carolinadev.com',
    industry: 'Real Estate Development',
    totalJobs: 23,
    totalRevenue: 420000,
    averageJobValue: 18260,
    paymentTerms: 45,
    creditRating: 'B',
    satisfactionScore: 4.2,
    referrals: 3,
    complaints: 2,
    recentJobs: ['job-002', 'job-005'],
    preferredServices: ['slab_sawing', 'wire_sawing', 'demolition'],
    communicationPreferences: {
      jobUpdates: true,
      arrivalNotifications: false,
      completionAlerts: true,
      invoiceDelivery: 'portal'
    }
  },
  {
    id: 'mecklenburg-county',
    name: 'Mecklenburg County Public Works',
    type: 'government',
    primaryContact: {
      name: 'David Thompson',
      title: 'Infrastructure Manager',
      email: 'dthompson@mecklenburgcountync.gov',
      phone: '(704) 555-0187'
    },
    address: {
      address: '600 East Fourth Street',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28202',
      coordinates: { lat: 35.2279, lng: -80.8364 }
    },
    industry: 'Government/Public Works',
    totalJobs: 15,
    totalRevenue: 280000,
    averageJobValue: 18667,
    paymentTerms: 60,
    creditRating: 'A',
    satisfactionScore: 4.9,
    referrals: 0,
    complaints: 0,
    recentJobs: ['job-006', 'job-007'],
    preferredServices: ['core_drilling', 'surface_preparation'],
    communicationPreferences: {
      jobUpdates: true,
      arrivalNotifications: true,
      completionAlerts: true,
      invoiceDelivery: 'mail'
    }
  }
];

export const DEMO_EMPLOYEES: DemoEmployee[] = [
  {
    id: 'emp-001',
    firstName: 'James',
    lastName: 'Wilson',
    role: 'foreman',
    certifications: ['OSHA 30', 'Silica Awareness', 'First Aid/CPR'],
    email: 'jwilson@precisionconcrete.com',
    phone: '(704) 555-0234',
    status: 'on_job',
    currentJob: 'job-001',
    currentLocation: {
      lat: 35.2330,
      lng: -80.8430,
      timestamp: new Date(Date.now() - 15 * 60 * 1000)
    },
    hourlyRate: 35,
    hoursWorked: 2080,
    efficiency: 94,
    safetyScore: 98,
    customerRating: 4.8,
    trainingCompleted: ['Platform Overview', 'Safety Compliance', 'Equipment Operation'],
    certificationsExpiring: [
      {
        certification: 'First Aid/CPR',
        expiryDate: new Date('2024-09-15'),
        renewalRequired: true
      }
    ],
    clockedIn: true,
    clockInTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    timeEntries: []
  },
  {
    id: 'emp-002',
    firstName: 'Maria',
    lastName: 'Garcia',
    role: 'operator',
    certifications: ['OSHA 10', 'Equipment Certification'],
    email: 'mgarcia@precisionconcrete.com',
    phone: '(704) 555-0245',
    status: 'on_job',
    currentJob: 'job-001',
    currentLocation: {
      lat: 35.2330,
      lng: -80.8430,
      timestamp: new Date(Date.now() - 10 * 60 * 1000)
    },
    hourlyRate: 28,
    hoursWorked: 2040,
    efficiency: 91,
    safetyScore: 96,
    customerRating: 4.6,
    trainingCompleted: ['Equipment Safety', 'Silica Monitoring'],
    certificationsExpiring: [],
    clockedIn: true,
    clockInTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    timeEntries: []
  },
  {
    id: 'emp-003',
    firstName: 'Robert',
    lastName: 'Johnson',
    role: 'project_manager',
    certifications: ['PMP', 'OSHA 30', 'Safety Management'],
    email: 'rjohnson@precisionconcrete.com',
    phone: '(704) 555-0256',
    status: 'active',
    hourlyRate: 42,
    hoursWorked: 2100,
    efficiency: 97,
    safetyScore: 99,
    customerRating: 4.9,
    trainingCompleted: ['Project Management', 'Customer Relations', 'System Administration'],
    certificationsExpiring: [
      {
        certification: 'PMP',
        expiryDate: new Date('2025-03-20'),
        renewalRequired: true
      }
    ],
    clockedIn: false,
    timeEntries: []
  }
];

export const DEMO_EQUIPMENT: DemoEquipment[] = [
  {
    id: 'eq-cd-001',
    name: 'Hilti DD 350',
    type: 'core_drill',
    model: 'DD 350-CA',
    serialNumber: 'HD350-2023-001',
    status: 'in_use',
    currentLocation: {
      lat: 35.2330,
      lng: -80.8430,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      accuracy: 3
    },
    assignedJob: 'job-001',
    assignedOperator: 'emp-002',
    lastMaintenance: new Date('2024-06-15'),
    nextMaintenanceDue: new Date('2024-08-15'),
    maintenanceHours: 200,
    totalHours: 1847,
    utilizationRate: 78,
    efficiency: 92,
    costPerHour: 45,
    gpsEnabled: true,
    bluetoothBeacon: {
      id: 'beacon-cd-001',
      batteryLevel: 87,
      signalStrength: -65,
      lastSeen: new Date(Date.now() - 2 * 60 * 1000),
      range: 30
    },
    maintenanceHistory: [
      {
        id: 'maint-001',
        date: new Date('2024-06-15'),
        type: 'routine',
        description: 'Routine 200-hour service',
        cost: 285,
        technician: 'Service Tech A',
        partsReplaced: ['Air filter', 'Oil'],
        nextServiceDue: new Date('2024-08-15')
      }
    ],
    realTimeData: {
      engineHours: 1847,
      temperature: 165,
      vibration: 2.3,
      dustLevel: 0.8,
      waterLevel: 85,
      pressure: 45,
      alerts: []
    }
  },
  {
    id: 'eq-ws-001',
    name: 'Husqvarna WS 482',
    type: 'wall_saw',
    model: 'WS 482 HF',
    serialNumber: 'HQ482-2023-003',
    status: 'available',
    currentLocation: {
      lat: 35.2271,
      lng: -80.8431,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      accuracy: 2
    },
    lastMaintenance: new Date('2024-06-20'),
    nextMaintenanceDue: new Date('2024-08-20'),
    maintenanceHours: 150,
    totalHours: 1542,
    utilizationRate: 85,
    efficiency: 94,
    costPerHour: 65,
    gpsEnabled: true,
    bluetoothBeacon: {
      id: 'beacon-ws-001',
      batteryLevel: 92,
      signalStrength: -58,
      lastSeen: new Date(Date.now() - 30 * 60 * 1000),
      range: 25
    },
    maintenanceHistory: [],
    realTimeData: {
      engineHours: 1542,
      temperature: 72,
      vibration: 0.1,
      alerts: []
    }
  },
  {
    id: 'eq-vehicle-001',
    name: 'Ford F-350 #1',
    type: 'vehicle',
    model: 'F-350 Super Duty',
    serialNumber: 'FORD-2022-001',
    status: 'in_use',
    currentLocation: {
      lat: 35.2330,
      lng: -80.8430,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      accuracy: 5
    },
    assignedJob: 'job-001',
    assignedOperator: 'emp-001',
    lastMaintenance: new Date('2024-06-10'),
    nextMaintenanceDue: new Date('2024-09-10'),
    maintenanceHours: 5000,
    totalHours: 15420,
    utilizationRate: 72,
    efficiency: 88,
    costPerHour: 25,
    gpsEnabled: true,
    maintenanceHistory: [],
    realTimeData: {
      engineHours: 15420,
      fuelLevel: 68,
      temperature: 190,
      vibration: 1.2,
      alerts: [
        {
          type: 'maintenance',
          severity: 'low',
          message: 'Oil change due in 500 miles',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          acknowledged: false
        }
      ]
    }
  }
];

export const DEMO_JOBS: DemoJob[] = [
  {
    id: 'job-001',
    jobNumber: 'PCC-2024-0847',
    title: 'Office Building Core Drilling - Atlantic Plaza',
    customer: 'Atlantic Construction Group',
    customerId: 'atlantic-construction',
    service: 'core_drilling',
    description: 'Core drilling for HVAC penetrations in concrete walls and slabs. 24 holes ranging from 6" to 12" diameter.',
    location: {
      address: '1200 South Tryon Street',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28203',
      coordinates: { lat: 35.2330, lng: -80.8430 }
    },
    scheduledDate: new Date(),
    estimatedDuration: 8,
    actualStartTime: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
    assignedCrew: ['emp-001', 'emp-002'],
    requiredEquipment: ['eq-cd-001', 'eq-vehicle-001'],
    assignedEquipment: ['eq-cd-001', 'eq-vehicle-001'],
    status: 'in_progress',
    progress: 65,
    lastUpdate: new Date(Date.now() - 15 * 60 * 1000),
    estimatedValue: 8500,
    actualCost: 3200,
    profitMargin: 62,
    safetyBriefingCompleted: true,
    silicaMonitoringRequired: true,
    ppeRequired: ['Safety glasses', 'Hard hat', 'Respiratory protection', 'Steel-toe boots'],
    incidentsReported: 0,
    photos: [
      {
        id: 'photo-001',
        url: '/demo/photos/job-001-before.jpg',
        caption: 'Work area before drilling commenced',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
        location: { lat: 35.2330, lng: -80.8430 },
        takenBy: 'emp-001',
        category: 'before'
      },
      {
        id: 'photo-002',
        url: '/demo/photos/job-001-progress.jpg',
        caption: 'Drilling in progress - 65% complete',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        location: { lat: 35.2330, lng: -80.8430 },
        takenBy: 'emp-002',
        category: 'during'
      }
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'HVAC Penetration Drawings',
        type: 'drawing',
        url: '/demo/docs/hvac-drawings.pdf',
        uploadedBy: 'emp-003',
        uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
        version: '1.0'
      }
    ],
    notes: [
      {
        id: 'note-001',
        content: 'Customer requested additional hole on 3rd floor - approved change order',
        author: 'emp-001',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: 'general',
        priority: 'medium'
      }
    ],
    currentLocation: {
      lat: 35.2330,
      lng: -80.8430,
      timestamp: new Date(Date.now() - 5 * 60 * 1000)
    },
    equipmentStatus: [
      {
        equipmentId: 'eq-cd-001',
        status: 'operational',
        location: { lat: 35.2330, lng: -80.8430, timestamp: new Date() },
        performance: { efficiency: 92, utilization: 78, alerts: 0 }
      }
    ],
    customerNotifications: [
      {
        id: 'notif-001',
        type: 'crew_dispatched',
        message: 'Crew has been dispatched and will arrive at 7:30 AM',
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        method: 'email',
        read: true
      },
      {
        id: 'notif-002',
        type: 'job_started',
        message: 'Core drilling has commenced. Expected completion by 4:00 PM',
        sentAt: new Date(Date.now() - 3.5 * 60 * 60 * 1000),
        method: 'email',
        read: true
      }
    ],
    customerSatisfaction: 4.8
  },
  {
    id: 'job-002',
    jobNumber: 'PCC-2024-0848',
    title: 'Residential Development Slab Sawing',
    customer: 'Carolina Property Developers',
    customerId: 'carolina-developers',
    service: 'slab_sawing',
    description: 'Expansion joint cutting in newly poured concrete slabs for residential development',
    location: {
      address: '4500 Prosperity Church Road',
      city: 'Charlotte',
      state: 'NC',
      zipCode: '28269',
      coordinates: { lat: 35.3394, lng: -80.7323 }
    },
    scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
    estimatedDuration: 6,
    assignedCrew: ['emp-003'],
    requiredEquipment: ['eq-ss-001'],
    assignedEquipment: [],
    status: 'scheduled',
    progress: 0,
    lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
    estimatedValue: 4500,
    safetyBriefingCompleted: false,
    silicaMonitoringRequired: true,
    ppeRequired: ['Safety glasses', 'Hard hat', 'Respiratory protection'],
    incidentsReported: 0,
    photos: [],
    documents: [],
    notes: [],
    equipmentStatus: [],
    customerNotifications: [
      {
        id: 'notif-003',
        type: 'job_scheduled',
        message: 'Your slab sawing job has been scheduled for tomorrow at 8:00 AM',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        method: 'email',
        read: false
      }
    ]
  }
];

export const REAL_TIME_DEMO: RealTimeDemo = {
  activeJobs: 3,
  equipmentInUse: 8,
  crewsOnSite: 5,
  jobUpdates: [
    {
      jobId: 'job-001',
      update: 'Hole #18 of 24 completed - 75% progress',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      location: { lat: 35.2330, lng: -80.8430 },
      photos: ['/demo/photos/progress-18.jpg']
    },
    {
      jobId: 'job-003',
      update: 'Wall cutting section 2 complete, moving to section 3',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      location: { lat: 35.2180, lng: -80.8610 }
    }
  ],
  equipmentLocations: [
    {
      equipmentId: 'eq-cd-001',
      name: 'Hilti DD 350',
      location: {
        lat: 35.2330,
        lng: -80.8430,
        timestamp: new Date(Date.now() - 2 * 60 * 1000)
      },
      status: 'working'
    },
    {
      equipmentId: 'eq-ws-001',
      name: 'Husqvarna WS 482',
      location: {
        lat: 35.2180,
        lng: -80.8610,
        timestamp: new Date(Date.now() - 3 * 60 * 1000)
      },
      status: 'working'
    }
  ],
  safetyAlerts: [
    {
      id: 'alert-001',
      type: 'silica_exposure',
      severity: 'medium',
      location: { lat: 35.2330, lng: -80.8430 },
      message: 'Silica exposure approaching action level - increase ventilation',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      acknowledged: true,
      jobId: 'job-001'
    }
  ],
  todaysMetrics: {
    date: new Date(),
    revenue: 24500,
    costs: 8900,
    profit: 15600,
    profitMargin: 63.7,
    jobsCompleted: 2,
    jobsInProgress: 3,
    equipmentUtilization: 84,
    crewEfficiency: 91,
    safetyIncidents: 0,
    silicaExposureEvents: 1,
    ppeComplianceRate: 98,
    customerSatisfaction: 4.7,
    onTimeDelivery: 95,
    communicationScore: 4.8
  },
  liveRevenue: 24500,
  efficiency: 91
};

export const DSM_COMPARISON: DSMComparison = {
  featureComparison: [
    {
      feature: 'Real-time Equipment Tracking',
      dsm: {
        available: false,
        rating: 1,
        description: 'Manual check-in/check-out system only',
        limitations: ['No GPS tracking', 'No real-time location', 'Manual updates only']
      },
      pontifex: {
        available: true,
        rating: 5,
        description: 'GPS + Bluetooth beacon tracking with real-time location',
        advantages: ['Live equipment location', 'Geofencing alerts', 'Utilization tracking']
      },
      impactArea: 'efficiency'
    },
    {
      feature: 'OSHA Silica Compliance',
      dsm: {
        available: false,
        rating: 1,
        description: 'No built-in compliance tracking',
        limitations: ['Manual documentation', 'No exposure monitoring', 'Paper-based records']
      },
      pontifex: {
        available: true,
        rating: 5,
        description: 'Automated silica exposure monitoring and compliance',
        advantages: ['Real-time monitoring', 'Automated documentation', 'Compliance reporting']
      },
      impactArea: 'compliance'
    },
    {
      feature: 'Customer Communication',
      dsm: {
        available: true,
        rating: 2,
        description: 'Basic email templates',
        limitations: ['Manual sending', 'Limited templates', 'No automation']
      },
      pontifex: {
        available: true,
        rating: 5,
        description: 'Automated real-time customer notifications',
        advantages: ['Auto job updates', 'SMS/Email/Portal', 'Real-time alerts']
      },
      impactArea: 'customer_satisfaction'
    },
    {
      feature: 'Mobile Field App',
      dsm: {
        available: true,
        rating: 2,
        description: 'Basic mobile access',
        limitations: ['Limited offline', 'Poor performance', 'Basic features']
      },
      pontifex: {
        available: true,
        rating: 5,
        description: 'Full-featured offline-capable mobile app',
        advantages: ['Offline functionality', 'Photo capture', 'Real-time sync']
      },
      impactArea: 'efficiency'
    }
  ],
  costComparison: {
    dsm: {
      licenseCost: 18000,
      implementationCost: 12000,
      trainingCost: 8000,
      maintenanceCost: 3600,
      totalCostPerYear: 21600
    },
    pontifex: {
      licenseCost: 15600,
      implementationCost: 8000,
      trainingCost: 4000,
      maintenanceCost: 2400,
      totalCostPerYear: 18000
    },
    savings: {
      yearly: 3600,
      percentage: 16.7,
      breakEvenMonths: 8
    }
  },
  roiCalculation: {
    timeToROI: 8,
    yearOneROI: 125,
    threeYearROI: 285,
    totalSavings: 54000,
    savingsBreakdown: {
      operationalEfficiency: 22000,
      reducedDowntime: 8500,
      improvedSafety: 6000,
      customerRetention: 12000,
      regulatoryCompliance: 5500
    }
  },
  migrationBenefits: [
    {
      category: 'Operational Efficiency',
      benefit: '20% increase in equipment utilization',
      quantifiedValue: 45000,
      timeframe: 'Year 1',
      demoData: { currentUtilization: 65, pontifexUtilization: 78 }
    },
    {
      category: 'Safety Compliance',
      benefit: '100% OSHA silica compliance',
      quantifiedValue: 15000,
      timeframe: 'Immediate',
      demoData: { finesPrevented: 15000, auditReadiness: 100 }
    },
    {
      category: 'Customer Satisfaction',
      benefit: '50% reduction in customer complaints',
      quantifiedValue: 25000,
      timeframe: '6 months',
      demoData: { currentComplaints: 12, targetComplaints: 6 }
    }
  ]
};

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'equipment-tracking',
    name: 'Real-time Equipment Tracking',
    description: 'Demonstrate the difference between DSM manual tracking and Pontifex real-time GPS/Bluetooth tracking',
    category: 'efficiency',
    setup: {
      situation: 'Equipment went missing from job site and customer is calling about delays',
      challenges: ['Unknown equipment location', 'Manual tracking unreliable', 'Customer satisfaction at risk'],
      goals: ['Locate missing equipment quickly', 'Prevent future losses', 'Maintain customer trust'],
      constraints: ['Equipment could be anywhere in 50-mile radius', 'Time-sensitive situation']
    },
    dsmApproach: [
      {
        step: 1,
        action: 'Call all crew members to ask about equipment location',
        timeRequired: 15,
        tools: ['Phone'],
        outcome: 'Mixed responses, no definitive location'
      },
      {
        step: 2,
        action: 'Drive to last known job site to search',
        timeRequired: 45,
        tools: ['Vehicle', 'Manual search'],
        outcome: 'Equipment not found at expected location'
      },
      {
        step: 3,
        action: 'Call customer to explain delay and reschedule',
        timeRequired: 10,
        tools: ['Phone'],
        outcome: 'Customer frustrated, relationship strained'
      }
    ],
    dsmLimitations: [
      'No real-time location data',
      'Relies on manual updates',
      'Time-consuming search process',
      'Poor customer experience'
    ],
    dsmOutcome: {
      timeToComplete: 70,
      accuracy: 60,
      customerSatisfaction: 2,
      costImpact: 850,
      safetyScore: 3
    },
    pontifexApproach: [
      {
        step: 1,
        action: 'Check real-time equipment dashboard',
        timeRequired: 2,
        tools: ['Pontifex Dashboard'],
        outcome: 'Exact GPS location identified immediately'
      },
      {
        step: 2,
        action: 'Send crew directly to equipment location',
        timeRequired: 20,
        tools: ['GPS navigation', 'Mobile app'],
        outcome: 'Equipment recovered quickly'
      },
      {
        step: 3,
        action: 'Auto-notify customer of updated arrival time',
        timeRequired: 1,
        tools: ['Automated notifications'],
        outcome: 'Customer informed proactively'
      }
    ],
    pontifexAdvantages: [
      'Real-time GPS tracking',
      'Instant location visibility',
      'Automated customer communication',
      'Reduced search time by 95%'
    ],
    pontifexOutcome: {
      timeToComplete: 23,
      accuracy: 100,
      customerSatisfaction: 4.5,
      costImpact: 125,
      safetyScore: 5
    },
    keyDifferences: [
      'Real-time vs manual tracking',
      '2 minutes vs 70 minutes to locate',
      'Proactive vs reactive communication',
      'Happy customers vs frustrated customers'
    ],
    quantifiedBenefits: [
      {
        metric: 'Time to locate equipment',
        dsmValue: 70,
        pontifexValue: 2,
        improvement: 97,
        annualImpact: 15000
      },
      {
        metric: 'Customer satisfaction',
        dsmValue: 2,
        pontifexValue: 4.5,
        improvement: 125,
        annualImpact: 25000
      }
    ],
    demoData: {
      equipmentLocations: DEMO_EQUIPMENT,
      realTimeTracking: true,
      customerNotifications: true
    },
    visualizations: [
      {
        type: 'map',
        title: 'Real-time Equipment Locations',
        data: DEMO_EQUIPMENT,
        insights: ['All equipment visible instantly', 'GPS accuracy within 3 meters', 'Battery levels monitored']
      }
    ]
  },
  {
    id: 'silica-compliance',
    name: 'OSHA Silica Compliance',
    description: 'Show automated silica monitoring vs manual DSM documentation',
    category: 'safety',
    setup: {
      situation: 'OSHA inspector arrives for surprise compliance audit',
      challenges: ['Need immediate access to silica exposure records', 'Manual documentation scattered', 'Potential violations and fines'],
      goals: ['Pass OSHA inspection', 'Demonstrate compliance', 'Avoid penalties'],
      constraints: ['Inspector on-site now', 'Records must be complete and accurate']
    },
    dsmApproach: [
      {
        step: 1,
        action: 'Search for paper silica exposure forms',
        timeRequired: 20,
        tools: ['File cabinets', 'Paper forms'],
        outcome: 'Some forms found, many missing or incomplete'
      },
      {
        step: 2,
        action: 'Try to reconstruct missing records from memory',
        timeRequired: 30,
        tools: ['Employee interviews', 'Guesswork'],
        outcome: 'Incomplete records, gaps in documentation'
      },
      {
        step: 3,
        action: 'Present incomplete documentation to inspector',
        timeRequired: 45,
        tools: ['Paper records', 'Explanations'],
        outcome: 'Inspector finds violations, issues citations'
      }
    ],
    dsmLimitations: [
      'Manual paper-based system',
      'Prone to human error',
      'Records easily lost',
      'No real-time monitoring'
    ],
    dsmOutcome: {
      timeToComplete: 95,
      accuracy: 45,
      customerSatisfaction: 1,
      costImpact: 15000,
      safetyScore: 2
    },
    pontifexApproach: [
      {
        step: 1,
        action: 'Access digital compliance dashboard',
        timeRequired: 2,
        tools: ['Pontifex compliance module'],
        outcome: 'Complete records instantly available'
      },
      {
        step: 2,
        action: 'Generate comprehensive compliance report',
        timeRequired: 3,
        tools: ['Automated reporting'],
        outcome: 'Detailed exposure data with timestamps'
      },
      {
        step: 3,
        action: 'Present digital records to inspector',
        timeRequired: 15,
        tools: ['Digital dashboard', 'Printed reports'],
        outcome: 'Inspector impressed, full compliance verified'
      }
    ],
    pontifexAdvantages: [
      'Automated exposure monitoring',
      'Digital record keeping',
      'Real-time compliance tracking',
      'Instant report generation'
    ],
    pontifexOutcome: {
      timeToComplete: 20,
      accuracy: 100,
      customerSatisfaction: 5,
      costImpact: 0,
      safetyScore: 5
    },
    keyDifferences: [
      'Digital vs paper records',
      'Real-time vs manual monitoring',
      'Complete vs incomplete documentation',
      '$0 fines vs $15,000 in penalties'
    ],
    quantifiedBenefits: [
      {
        metric: 'Compliance preparation time',
        dsmValue: 95,
        pontifexValue: 20,
        improvement: 79,
        annualImpact: 8000
      },
      {
        metric: 'OSHA violation costs',
        dsmValue: 15000,
        pontifexValue: 0,
        improvement: 100,
        annualImpact: 15000
      }
    ],
    demoData: {
      complianceRecords: true,
      silicaMonitoring: true,
      oshaReports: true
    },
    visualizations: [
      {
        type: 'dashboard',
        title: 'OSHA Compliance Dashboard',
        data: { compliance: 100, exposureEvents: 3, violations: 0 },
        insights: ['100% compliance maintained', 'All exposure events documented', 'Zero violations this year']
      }
    ]
  }
];

export const SALES_DEMO_DATA: SalesDemoData = {
  company: DEMO_COMPANY,
  jobs: DEMO_JOBS,
  equipment: DEMO_EQUIPMENT,
  employees: DEMO_EMPLOYEES,
  customers: DEMO_CUSTOMERS,
  realTimeData: REAL_TIME_DEMO,
  metrics: {
    monthlyRevenue: [
      { month: 'Jan', year: 2024, revenue: 245000, growth: 12 },
      { month: 'Feb', year: 2024, revenue: 278000, growth: 18 },
      { month: 'Mar', year: 2024, revenue: 312000, growth: 22 },
      { month: 'Apr', year: 2024, revenue: 298000, growth: 15 },
      { month: 'May', year: 2024, revenue: 334000, growth: 28 },
      { month: 'Jun', year: 2024, revenue: 356000, growth: 31 }
    ],
    profitability: {
      grossMargin: 65,
      netMargin: 18,
      costReduction: 12,
      efficiencyGains: 23
    },
    equipmentUtilization: [
      { equipmentType: 'core_drill', utilization: 78, improvement: 15 },
      { equipmentType: 'wall_saw', utilization: 85, improvement: 22 },
      { equipmentType: 'slab_saw', utilization: 72, improvement: 18 }
    ],
    jobCompletionTimes: [
      { service: 'core_drilling', averageTime: 6.2, improvement: 18 },
      { service: 'wall_sawing', averageTime: 4.8, improvement: 25 },
      { service: 'slab_sawing', averageTime: 5.5, improvement: 15 }
    ],
    customerSatisfaction: [
      { month: 'Jan', score: 4.2, improvement: 0 },
      { month: 'Feb', score: 4.4, improvement: 5 },
      { month: 'Mar', score: 4.6, improvement: 10 },
      { month: 'Apr', score: 4.7, improvement: 12 },
      { month: 'May', score: 4.8, improvement: 14 },
      { month: 'Jun', score: 4.9, improvement: 17 }
    ],
    customerRetention: {
      rate: 94,
      improvement: 12,
      valueIncrease: 85000
    },
    safetyMetrics: {
      incidentRate: 0.8,
      complianceScore: 98,
      silicaMonitoring: {
        monitored: 100,
        compliant: 98,
        alerts: 5
      },
      training: {
        completed: 95,
        upToDate: 92,
        certifications: 87
      }
    },
    complianceScores: [
      { area: 'OSHA Silica', score: 98, improvement: 45 },
      { area: 'PPE Compliance', score: 96, improvement: 28 },
      { area: 'Training Records', score: 94, improvement: 35 }
    ],
    dsmComparison: {
      dsm: {
        jobManagement: { score: 6, description: 'Basic job tracking', features: ['Job creation', 'Status updates'] },
        customerManagement: { score: 5, description: 'Contact management', features: ['Customer database', 'Basic communication'] },
        equipmentTracking: { score: 3, description: 'Manual check-in/out', features: ['Equipment list', 'Manual status'] },
        safetyCompliance: { score: 2, description: 'Paper-based forms', features: ['Basic forms', 'Manual tracking'] },
        reporting: { score: 4, description: 'Basic reports', features: ['Standard reports', 'Limited customization'] },
        mobileAccess: { score: 4, description: 'Basic mobile app', features: ['View jobs', 'Update status'] },
        realTimeUpdates: { score: 2, description: 'Manual updates only', features: ['Delayed updates', 'Manual entry'] },
        automation: { score: 3, description: 'Limited automation', features: ['Basic workflows', 'Manual triggers'] }
      },
      pontifex: {
        jobManagement: { score: 9, description: 'Comprehensive job lifecycle', features: ['Smart scheduling', 'Real-time tracking', 'Auto-updates'] },
        customerManagement: { score: 9, description: 'Full CRM with automation', features: ['360° customer view', 'Auto-communication', 'Portal access'] },
        equipmentTracking: { score: 10, description: 'Real-time GPS + Bluetooth', features: ['Live location', 'Utilization tracking', 'Maintenance alerts'] },
        safetyCompliance: { score: 10, description: 'Automated OSHA compliance', features: ['Silica monitoring', 'Digital forms', 'Auto-reporting'] },
        reporting: { score: 9, description: 'Advanced analytics', features: ['Custom dashboards', 'Predictive insights', 'Real-time metrics'] },
        mobileAccess: { score: 9, description: 'Full-featured offline app', features: ['Offline capability', 'Photo capture', 'Real-time sync'] },
        realTimeUpdates: { score: 10, description: 'Live updates and notifications', features: ['Instant updates', 'Auto-notifications', 'Live tracking'] },
        automation: { score: 9, description: 'Intelligent automation', features: ['Smart workflows', 'Predictive alerts', 'Auto-optimization'] },
        advancedAnalytics: { score: 9, description: 'Business intelligence', features: ['Predictive analytics', 'Performance insights', 'Trend analysis'] },
        bluetoothTracking: { score: 10, description: 'Indoor/outdoor precision tracking', features: ['Beacon technology', 'Sub-meter accuracy', 'Battery monitoring'] },
        oshaCompliance: { score: 10, description: 'Complete OSHA framework', features: ['Silica compliance', 'Incident management', 'Audit readiness'] },
        predictiveMaintenance: { score: 8, description: 'AI-powered maintenance', features: ['Failure prediction', 'Optimal scheduling', 'Cost optimization'] }
      },
      advantages: [
        {
          category: 'Equipment Tracking',
          advantage: 'Real-time GPS + Bluetooth vs manual check-in/out',
          impact: 'high',
          quantifiableBenefit: '78% utilization improvement',
          demoScenario: 'equipment-tracking'
        },
        {
          category: 'Safety Compliance',
          advantage: 'Automated OSHA silica monitoring vs paper forms',
          impact: 'high',
          quantifiableBenefit: '$15K+ in avoided fines annually',
          demoScenario: 'silica-compliance'
        },
        {
          category: 'Customer Communication',
          advantage: 'Automated real-time notifications vs manual calls',
          impact: 'medium',
          quantifiableBenefit: '50% reduction in customer complaints'
        }
      ]
    }
  },
  comparisons: DSM_COMPARISON,
  scenarios: DEMO_SCENARIOS
};