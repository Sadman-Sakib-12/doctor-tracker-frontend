import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Fetches data when `params` values change.
 * Uses JSON.stringify comparison to avoid re-fetching on object reference changes.
 */
export function useFetch<T>(
  fetcher: (params: Record<string, unknown>) => Promise<T>,
  params: Record<string, unknown>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable ref to fetcher so it never causes re-runs
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Serialize params — only re-run effect when actual values change
  const paramsStr = JSON.stringify(params);

  const run = useCallback(async (p: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(p);
      setData(result);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to load data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only fires when the serialized params string changes
  useEffect(() => {
    run(JSON.parse(paramsStr));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsStr]);

  const refetch = useCallback(() => {
    run(JSON.parse(paramsStr));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsStr]);

  return { data, loading, error, refetch };
}
