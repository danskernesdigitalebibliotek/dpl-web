import { useEffect } from "react";
import { useQueryState, parseAsStringEnum } from "nuqs";
import { FormView } from "../types";
import { useSearchQueries } from "./use-search-queries";

interface UseFormVisibilityReturn {
  view: FormView;
  showResults: boolean;
  setView: (value: FormView) => Promise<URLSearchParams>;
}

/**
 * Hook to manage form visibility state in URL
 * Reads from URL state to determine if there's an active search query
 */
export const useFormVisibility = (): UseFormVisibilityReturn => {
  const [view, setView] = useQueryState(
    "view",
    parseAsStringEnum<FormView>(["search", "results"]).withDefault("search")
  );

  // Reuse the committed query so this hook and the results agree on what
  // counts as a search, including toggles and radio filters.
  const { isSearchEnabled } = useSearchQueries();

  // Ensure we show the form when there is no current query (e.g. after clearing)
  useEffect(() => {
    if (!isSearchEnabled && view !== "search") {
      setView("search");
    }
  }, [isSearchEnabled, view, setView]);

  const showResults = view === "results" && isSearchEnabled;

  return {
    view,
    showResults,
    setView
  };
};
