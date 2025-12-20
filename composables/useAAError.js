export function useAAError() {
  const ERROR_TYPES = {
    UNKNOWN: 'unknown',
    STRING: 'string',
    XPATH: 'xpath',
    CODE_LINES: 'codeLines',
    CALL_CHAIN: 'callChain',
    OBJECT: 'object'
  };

  function getErrorType(parsed) {
    if (!parsed?.error) return ERROR_TYPES.UNKNOWN;
    if (typeof parsed.error === 'string') return ERROR_TYPES.STRING;
    
    const keys = Object.keys(parsed.error);
    if (keys.includes('callChain')) return ERROR_TYPES.CALL_CHAIN;
    if (keys.includes('codeLines')) return ERROR_TYPES.CODE_LINES;
    if (keys.includes('xpath')) return ERROR_TYPES.XPATH;
    
    return ERROR_TYPES.OBJECT;
  }

  function extractCallChain(obj, result) {
    if (!result) result = { addresses: [], nestedError: null };
    if (!obj) return result;

    if (obj.address) {
      result.addresses.push(obj.address);
    }

    if (obj.message) {
      result.nestedError = {
        message: obj.message,
        formattedContext: obj.formattedContext || '',
        codeLines: obj.codeLines || [],
        trace: obj.trace || []
      };
      if (!obj.next) return result;
    }

    if (obj.next) {
      if (typeof obj.next === 'object' && obj.next['0'] !== undefined) {
        let errorText = '';
        for (let i = 0; obj.next[String(i)] !== undefined; i++) {
          errorText += obj.next[String(i)];
        }
        result.nestedError = { message: errorText };
        if (obj.next.address) {
          result.addresses.push(obj.next.address);
        }
      } else {
        extractCallChain(obj.next, result);
      }
    }
    return result;
  }

  function parseAAResponse(response) {
    let parsed;
    if (typeof response === 'string') {
      try {
        parsed = JSON.parse(response);
      } catch {
        parsed = { error: response };
      }
    } else {
      parsed = response || {};
    }

    const errorType = getErrorType(parsed);
    const hasError = !!parsed.error;
    const error = parsed.error;

    let result = {
      parsed,
      errorType,
      hasError,
      message: '',
      details: {}
    };

    if (!hasError) return result;

    if (typeof error === 'string') {
      result.message = error;
      return result;
    }

    result.message = error.message || '';

    if (errorType === ERROR_TYPES.XPATH) {
      result.details = { xpath: error.xpath };
    } else if (errorType === ERROR_TYPES.CALL_CHAIN) {
      const chainData = extractCallChain(error.callChain);
      if (chainData.nestedError?.message) {
        result.message += chainData.nestedError.message;
      }
      result.details = {
        addresses: chainData.addresses,
        formattedContext: chainData.nestedError?.formattedContext || '',
        codeLines: chainData.nestedError?.codeLines || [],
        trace: chainData.nestedError?.trace || []
      };
    } else if (errorType === ERROR_TYPES.CODE_LINES) {
      result.details = {
        formattedContext: error.formattedContext || '',
        codeLines: error.codeLines || [],
        trace: error.trace || []
      };
    } else if (errorType === ERROR_TYPES.OBJECT) {
      result.details = { raw: error };
    }

    return result;
  }

  return {
    ERROR_TYPES,
    getErrorType,
    parseAAResponse
  };
}
