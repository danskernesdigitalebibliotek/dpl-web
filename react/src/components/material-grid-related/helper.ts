import {
  MaterialGridComplexSearchQuery,
  MaterialGridRecommendationsQuery,
  WorkForMaterialGridFragment
} from "../../core/dbc-gateway/generated/graphql";
import {
  MaterialGridFilterOption,
  MaterialGridFilterType
} from "./MaterialGridRelated.types";

export function prepareCreatorCql(creators: string[]): string {
  if (creators.length === 0) return "";
  return creators.map((name) => `term.creator='${name}'`).join(" OR ");
}

export function extractWorksFromRecommendations(
  data?: MaterialGridRecommendationsQuery
): WorkForMaterialGridFragment[] {
  if (!data?.recommend?.result) return [];
  return data.recommend.result.map(({ work }) => work);
}
export function extractWorksFromComplexSearch(
  data?: MaterialGridComplexSearchQuery
): WorkForMaterialGridFragment[] {
  if (!data?.complexSearch?.works) return [];
  return data.complexSearch.works;
}
export function getPreferredFallback(
  options: MaterialGridFilterOption[]
): MaterialGridFilterType | undefined {
  const preferred: MaterialGridFilterType[] = [
    "recommendation",
    "series",
    "author"
  ];
  return preferred.find((f) => options.some((o) => o.value === f));
}
