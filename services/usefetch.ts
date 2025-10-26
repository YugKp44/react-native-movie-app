import { useState, useEffect } from "react";

const useFetch = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    try {
      console.log('useFetch: Starting fetch...');
      setLoading(true);
      setError(null);

      const result = await fetchFunction();
      console.log('useFetch: Fetch completed successfully');
      setData(result);
    } catch (err) {
      console.log('useFetch: Fetch failed with error:', err);
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
    } finally {
      console.log('useFetch: Setting loading to false');
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
    setLoading(false);
  };

  useEffect(() => {
    if (autoFetch) {
      console.log('useFetch: Auto-fetching data...');
      fetchData();
    }
  }, []);

  return { data, loading, error, refetch: fetchData, reset };
};

export default useFetch;
