import { prettifyJson } from './text';

export function findCodeBlockLine(definition, xpath, relativeLine) {
  if (!definition || !xpath) return null;

  let parsed;
  try {
    parsed = typeof definition === 'string' ? JSON.parse(definition) : definition;
  } catch {
    return null;
  }

  const prettified = prettifyJson(parsed);
  const lines = prettified.split('\n');
  
  const pathParts = xpath.split('/').filter(Boolean);
  if (pathParts.length === 0) return relativeLine;

  let searchFromLine = 0;
  let searchToLine = lines.length;

  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    const numericIndex = parseInt(part, 10);
    const isIndex = !isNaN(numericIndex);
    
    if (isIndex) {
      let itemCount = 0;
      let depth = 0;
      let foundStart = false;
      let found = false;
      let itemStartLine = searchFromLine;
      let itemEndLine = searchToLine;
      
      for (let lineIdx = searchFromLine; lineIdx < searchToLine && !found; lineIdx++) {
        const line = lines[lineIdx];
        
        for (let charIdx = 0; charIdx < line.length; charIdx++) {
          const char = line[charIdx];
          
          if (char === '[' || char === '{') {
            if (!foundStart && char === '[') {
              foundStart = true;
              depth = 0;
            } else if (foundStart) {
              if (depth === 0 && char === '{') {
                if (itemCount === numericIndex) {
                  itemStartLine = lineIdx;
                }
              }
              depth++;
            }
          } else if ((char === ']' || char === '}') && foundStart) {
            if (depth === 0 && char === ']') {
              foundStart = false;
            } else {
              depth--;
              if (depth === 0 && char === '}') {
                if (itemCount === numericIndex) {
                  itemEndLine = lineIdx;
                  searchFromLine = itemStartLine;
                  searchToLine = itemEndLine;
                  found = true;
                  break;
                }
                itemCount++;
              }
            }
          }
        }
      }
    } else {
      const keyPattern = new RegExp(`"${part}"\\s*:`);
      let foundKey = false;
      
      for (let lineIdx = searchFromLine; lineIdx < searchToLine; lineIdx++) {
        const line = lines[lineIdx];
        
        if (keyPattern.test(line)) {
          searchFromLine = lineIdx;
          foundKey = true;
          break;
        }
      }
      
      if (!foundKey) return null;
    }
  }

  if (relativeLine) {
    return searchFromLine + relativeLine;
  }
  
  return searchFromLine + 1;
}

export function getAddressForTrace(trace, currentIndex) {
  if (!trace || !Array.isArray(trace)) return null;
  
  for (let i = currentIndex; i >= 0; i--) {
    if (trace[i]?.aa) {
      return trace[i].aa;
    }
  }
  
  return null;
}
