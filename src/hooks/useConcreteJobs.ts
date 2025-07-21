import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ConcreteWorkType } from '@/types/concrete-work-types';
import { BeaconData } from '@/lib/bluetooth';

interface JobUpdate {
  jobId: string;
  type: 'status' | 'progress' | 'compliance' | 'crew' | 'equipment';
  data: any;
}

interface UseConcreteJobsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  includeCompleted?: boolean;
}

export function useConcreteJobs(options: UseConcreteJobsOptions = {}) {
  const {
    autoRefresh = true,
    refreshInterval = 30000,
    includeCompleted = false
  } = options;

  const supabase = createClient();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Fetch jobs from database
  const fetchJobs = useCallback(async () => {
    try {
      let query = supabase
        .from('work_orders')
        .select(`
          *,
          silica_exposure_assessments(*),
          safety_compliance_details(*),
          job_assignments(*, profiles(*)),
          job_asset_assignments(*, assets(*))
        `)
        .order('created_at', { ascending: false });

      if (!includeCompleted) {
        query = query.in('status', ['pending', 'in_progress', 'scheduled']);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data to match our interface
      const transformedJobs = data?.map(job => ({
        id: job.id,
        orderNumber: job.order_number,
        workType: job.work_type as ConcreteWorkType,
        clientName: job.client_name,
        siteAddress: job.site_address,
        status: job.status,
        priority: job.priority || 'medium',
        scheduledDate: new Date(job.scheduled_date),
        startedAt: job.started_at ? new Date(job.started_at) : undefined,
        crew: job.job_assignments?.map((assignment: any) => ({
          id: assignment.employee_id,
          name: assignment.profiles?.full_name || 'Unknown',
          role: assignment.role,
          status: 'off_site', // Would be updated by beacon data
          certifications: []
        })) || [],
        equipment: job.job_asset_assignments?.map((assignment: any) => ({
          id: assignment.asset_id,
          name: assignment.assets?.name || 'Unknown',
          type: assignment.assets?.asset_type || 'Unknown',
          status: assignment.is_active ? 'in_use' : 'available',
          hoursUsed: 0
        })) || [],
        compliance: {
          ppeVerified: job.safety_compliance_details?.[0]?.hearing_protection && 
                       job.safety_compliance_details?.[0]?.eye_protection &&
                       job.safety_compliance_details?.[0]?.respiratory_protection || false,
          waterSystemActive: job.water_supply_verified || false,
          dustControlVerified: job.dust_control_verified || false,
          controlPlanApproved: true, // Would check exposure_control_plans table
          issues: []
        },
        progress: {
          totalLength: job.length_mm || 0,
          completedLength: 0, // Would calculate from progress updates
          percentage: 0,
          estimatedCompletion: new Date(Date.now() + 8 * 60 * 60 * 1000),
          photosUploaded: 0
        },
        exposureLevel: job.silica_exposure_assessments?.[0]?.exposure_level || 0,
        riskLevel: job.silica_exposure_assessments?.[0]?.risk_level || 'medium',
        indoor: job.indoor_outdoor === 'indoor',
        dimensions: {
          length: job.length_mm || 0,
          depth: job.depth_mm || 0,
          width: job.width_mm
        }
      })) || [];

      setJobs(transformedJobs);
      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [supabase, includeCompleted]);

  // Set up real-time subscriptions
  useEffect(() => {
    fetchJobs();

    // Subscribe to job updates
    const channel = supabase
      .channel('job-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_orders'
      }, (payload) => {
        console.log('Job update:', payload);
        
        // Handle different types of changes
        if (payload.eventType === 'INSERT') {
          fetchJobs(); // Refetch all jobs
        } else if (payload.eventType === 'UPDATE') {
          setJobs(prev => prev.map(job => 
            job.id === payload.new.id 
              ? { ...job, ...transformJobData(payload.new) }
              : job
          ));
        } else if (payload.eventType === 'DELETE') {
          setJobs(prev => prev.filter(job => job.id !== payload.old.id));
        }
      })
      .subscribe();

    // Auto-refresh
    let refreshTimer: NodeJS.Timeout;
    if (autoRefresh) {
      refreshTimer = setInterval(fetchJobs, refreshInterval);
    }

    return () => {
      supabase.removeChannel(channel);
      if (refreshTimer) clearInterval(refreshTimer);
    };
  }, [supabase, fetchJobs, autoRefresh, refreshInterval]);

  // Update job with beacon data
  const updateJobWithBeaconData = useCallback((beacons: BeaconData[]) => {
    setJobs(prev => prev.map(job => {
      const updatedCrew = job.crew.map((member: any) => {
        const beacon = beacons.find(b => b.id === member.beaconId);
        if (beacon) {
          return {
            ...member,
            status: beacon.distance < 10 ? 'on_site' : 'nearby' as any,
            location: `${beacon.distance.toFixed(1)}m away`,
            lastSeen: new Date()
          };
        }
        return member;
      });

      const updatedEquipment = job.equipment.map((item: any) => {
        const beacon = beacons.find(b => b.id === item.beaconId);
        if (beacon) {
          return {
            ...item,
            batteryLevel: (beacon as any).batteryLevel
          };
        }
        return item;
      });

      return {
        ...job,
        crew: updatedCrew,
        equipment: updatedEquipment
      };
    }));
  }, []);

  // Update job progress
  const updateJobProgress = useCallback(async (jobId: string, progress: Partial<any>) => {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({
          ...progress,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      if (error) throw error;

      // Optimistically update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, progress: { ...job.progress, ...progress } }
          : job
      ));
    } catch (err) {
      console.error('Error updating job progress:', err);
      throw err;
    }
  }, [supabase]);

  // Update compliance status
  const updateCompliance = useCallback(async (jobId: string, compliance: Partial<any>) => {
    try {
      const { error } = await supabase
        .from('safety_compliance_details')
        .upsert({
          work_order_id: jobId,
          ...compliance,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Optimistically update local state
      setJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, compliance: { ...job.compliance, ...compliance } }
          : job
      ));
    } catch (err) {
      console.error('Error updating compliance:', err);
      throw err;
    }
  }, [supabase]);

  return {
    jobs,
    loading,
    error,
    lastUpdate,
    refetch: fetchJobs,
    updateJobWithBeaconData,
    updateJobProgress,
    updateCompliance
  };
}

// Helper function to transform database data
function transformJobData(dbData: any) {
  return {
    status: dbData.status,
    priority: dbData.priority,
    startedAt: dbData.started_at ? new Date(dbData.started_at) : undefined,
    // Add other transformations as needed
  };
}