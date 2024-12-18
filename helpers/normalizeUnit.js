// normalize unit from route
export function normalizeUnit(unit) {
  if (!unit) return unit;
  
  if (typeof unit === 'string') {
    return unit;
  }
  
  return unit.join('/');
} 
