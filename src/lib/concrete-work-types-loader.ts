import { ConcreteWorkType, WorkTypeDetails } from '@/types/concrete-work-types';

let workTypesCache: Record<ConcreteWorkType, WorkTypeDetails> | null = null;

export async function loadConcreteWorkTypes(): Promise<Record<ConcreteWorkType, WorkTypeDetails>> {
  if (workTypesCache) {
    return workTypesCache;
  }

  // Dynamically import the work types data
  const workTypesModule = await import('@/types/concrete-work-types');
  workTypesCache = workTypesModule.CONCRETE_WORK_TYPES;
  
  return workTypesCache;
}

// Preload function for critical paths
export function preloadConcreteWorkTypes() {
  if (typeof window !== 'undefined' && !workTypesCache) {
    // Use requestIdleCallback if available, otherwise use setTimeout
    const callback = () => loadConcreteWorkTypes();
    
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(callback);
    } else {
      setTimeout(callback, 1);
    }
  }
}