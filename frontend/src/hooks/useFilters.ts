import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

type FilterObjectType = Record<string, any>;
export const useFilters = (
  searchParamNames: string[]
): [FilterObjectType, (filters: FilterObjectType) => void] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState<FilterObjectType>({});

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

  const setFiltersCallback = useCallback((filters: FilterObjectType) => {
    setSearchParams(new URLSearchParams(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [filters, setFiltersCallback];
};
