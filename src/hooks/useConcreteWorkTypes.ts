import { useMemo } from 'react';
import { CONCRETE_WORK_TYPES, ConcreteWorkType, WorkTypeDetails } from '@/types/concrete-work-types';

export function useConcreteWorkTypes(category?: 'drilling' | 'sawing' | 'breaking' | 'finishing') {
  const filteredWorkTypes = useMemo(() => {
    const allTypes = Object.values(CONCRETE_WORK_TYPES);
    
    if (!category) {
      return allTypes;
    }
    
    return allTypes.filter(type => type.category === category);
  }, [category]);
  
  const getWorkTypeById = useMemo(() => {
    return (id: ConcreteWorkType): WorkTypeDetails | undefined => {
      return CONCRETE_WORK_TYPES[id];
    };
  }, []);
  
  return {
    workTypes: filteredWorkTypes,
    getWorkTypeById,
    allWorkTypes: CONCRETE_WORK_TYPES
  };
}