import { useCallback, useEffect, useState } from "react";
import {
  SearchWithPaginationQuery,
  SearchWithPaginationQueryVariables,
  useSearchWithPaginationQuery,
  useSearchWithPaginationGoVipQuery
} from "../../core/dbc-gateway/generated/graphql";

interface UseGetMaterialListSearchOptions {
  useGoVipProfile?: boolean;
}

interface UseGetMaterialListSearchReturn {
  searchListData: SearchWithPaginationQuery["search"]["works"];
  isLoading: boolean;
  searchInput: string;
  setSearchInput: (value: string) => void;
  loadMore: () => void;
  hitCount: number;
}

const useGetMaterialListSearch = ({
  useGoVipProfile
}: UseGetMaterialListSearchOptions = {}): UseGetMaterialListSearchReturn => {
  const [state, setState] = useState({
    searchInput: "",
    page: 1
  });
  const [searchListData, setSearchListData] = useState<
    SearchWithPaginationQuery["search"]["works"]
  >([]);
  const [hitCount, setHitCount] = useState<number>(0);

  const { searchInput, page } = state;

  const pageSize = 10;

  const queryVariables: SearchWithPaginationQueryVariables = {
    q: { all: searchInput },
    offset: (page - 1) * pageSize,
    limit: pageSize
  };

  const regularQuery = useSearchWithPaginationQuery(queryVariables, {
    enabled: !useGoVipProfile
  });

  const goVipQuery = useSearchWithPaginationGoVipQuery(queryVariables, {
    enabled: !!useGoVipProfile
  });

  const { data, isLoading } = useGoVipProfile ? goVipQuery : regularQuery;

  useEffect(() => {
    if (data?.search?.works) {
      setSearchListData((prevData) =>
        page === 1 ? data.search.works : [...prevData, ...data.search.works]
      );
      setHitCount(data.search.hitcount);
    }
  }, [data, page]);

  const setSearchInputAndResetPage = useCallback((input: string) => {
    setState({ searchInput: input, page: 1 });
  }, []);

  const loadMore = useCallback(() => {
    setState((prevState) => ({ ...prevState, page: prevState.page + 1 }));
  }, []);

  return {
    searchListData,
    isLoading,
    searchInput,
    setSearchInput: setSearchInputAndResetPage,
    loadMore,
    hitCount
  };
};

export default useGetMaterialListSearch;
