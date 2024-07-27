import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";

type FilterObjectType = Record<string, any>;
export const useListPage = <T = any>(
  loader: (filters?: FilterObjectType) => Promise<T>,
  searchParamNames: string[]
) => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const filters = searchParamNames.reduce((acc, name) => {
      if (searchParams.get(name)) {
        acc[name] = searchParams.get(name);
      }
      return acc;
    }, {} as any);
    setFilters(filters);
    // Not listening for changes in the filter names. it should be constant
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const [filters, setFilters] = useState<FilterObjectType | undefined>(
    undefined
  );

  useEffect(() => {
    if (filters === undefined) {
      return;
    }

    setLoading(true);
    loader(filters).then((d) => {
      setData(d);
      setLoading(false);
    });
  }, [filters, loader]);

  const setFiltersCallback = useCallback((filters: FilterObjectType) => {
    setSearchParams(new URLSearchParams(filters));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    filters,
    setFilters: setFiltersCallback,
  };
};
