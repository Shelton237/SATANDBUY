import axios from "axios";
import { useEffect, useState } from "react";
import { clearUserSession } from "@lib/auth";

const useAsync = (asyncFunction) => {
  const [data, setData] = useState([] || {});
  const [error, setError] = useState("");
  const [errCode, setErrCode] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();

    (async () => {
      try {
        const res = await asyncFunction({ cancelToken: source.token });
        if (!unmounted) {
          setData(res);
          // console.log("res", res);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        setErrCode(err?.response?.status);
        if (!unmounted) {
          console.log("API Error:", err.message);
          setError(err.message);
          if (axios.isCancel(err)) {
            setLoading(false);
          } else {
            setLoading(false);
            setData({});
          }
        }
      }
    })();

    return () => {
      unmounted = true;
      source.cancel("Cancelled in cleanup");
    };
  }, []);

  useEffect(() => {
    if (errCode === 401) {
      console.log("status 401 - Unauthorized access - Logging out...");
      clearUserSession();
      window.location.replace(`${process.env.NEXT_PUBLIC_STORE_DOMAIN || "/"}`);
    }
  }, [errCode]);

  return {
    data,
    error,
    loading,
  };
};

export default useAsync;
