import { useState, useEffect, useRef } from "react";

/**
 * Generic fetch hook that only re-fetches when `params` deeply changes.
 * Prevents infinite loops caused by object reference changes.
 */
export function useFetch<T>(
  fetcher: (params: Record<string, unknown>) => Promise<T>,
  params: Record<string, unknown>
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Serialize params to detect actual value changes (not reference changes)
  const paramsKey = JSON.stringify(params);
  const prevKey = useRef<string>("");

  const run = async (p: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher(p);
      setData(result);
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Failed to load data";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if params actually changed in value
    if (prevKey.current === paramsKey) return;
    prevKey.current = paramsKey;
    run(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey]);

  const refetch = () => run(params);

  return { data, loading, error, refetch };
}
