import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing async operations with loading, error, and reload states
 * @param {Function} asyncFunction - An async function that returns a promise
 * @param {boolean} immediate - Whether to execute immediately on mount
 * @param {Array} deps - Dependency array for re-triggering execution
 */
export function useAsync(asyncFunction, immediate = true, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await asyncFunction(...args);
      setData(response);
      return response;
    } catch (err) {
      setError(err?.message || 'An unexpected error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, deps);

  return { execute, loading, data, error, setData };
}
