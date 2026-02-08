import axios from "axios";
// import Cookies from 'js-cookie';
import { useContext, useEffect, useState } from "react";
import { SidebarContext } from "@/context/SidebarContext";

const useAsync = (asyncFunction) => {
  const [data, setData] = useState([] || {});
  const [error, setError] = useState("");
  // const [errCode, setErrCode] = useState('');
  const [loading, setLoading] = useState(true);
  const {
    invoice,
    status,
    zone,
    time,
    source,
    limitData,
    startDate,
    endDate,
    method,
    owner,
    isUpdate,
    setIsUpdate,
    currentPage,
    category,
    searchText,
    sortedField,
  } = useContext(SidebarContext);

  useEffect(() => {
    let unmounted = false;
    let source = axios.CancelToken.source();
    (async () => {
      try {
        const res = await asyncFunction({ cancelToken: source.token });
        if (!unmounted) {
          const isAxiosResponse =
            res &&
            typeof res === "object" &&
            "data" in res &&
            ("status" in res || "headers" in res);
          const payload = isAxiosResponse ? res.data : res;
          setData(payload);
          setError("");
          setLoading(false);
        }
      } catch (err) {
        if (!unmounted) {
          setError(err.message);
          if (axios.isCancel(err)) {
            setError(err.message);
            setLoading(false);
            setData([]);
          } else {
            setError(err.message);
            setLoading(false);
            setData([]);
          }
        }
      }
    })();

    setIsUpdate(false);

    return () => {
      unmounted = true;
      source.cancel("Cancelled in cleanup");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    invoice,
    status,
    zone,
    time,
    method,
    owner,
    source,
    limitData,
    startDate,
    endDate,
    isUpdate,
    currentPage,
    category,
    searchText,
    sortedField,
  ]);

  return {
    data,
    error,
    loading,
  };
};

export default useAsync;
