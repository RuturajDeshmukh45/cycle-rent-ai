import { useState, useEffect } from 'react';

const useFetch = (fetchFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const execute = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchFn();
      setData(res.data?.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { execute(); }, deps);

  return { data, loading, error, refetch: execute };
};

export default useFetch;
