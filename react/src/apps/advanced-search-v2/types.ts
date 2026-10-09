import { ComplexSearchFacetsEnum } from "../../core/dbc-gateway/generated/graphql";

export type {
  Operator,
  FilterState,
  FacetState,
  FormView
} from "../../core/advanced-search/types";
export { SortOption } from "../../core/advanced-search/types";

export type Option = {
  label: string;
  value: string;
  count?: number;
};

export const DIVIDER_VALUE = "__divider__";

export type RangeValue = {
  from: number | null;
  to: number | null;
};

export type RangePreset = {
  id: string;
  label: string;
  from: number;
  to: number | null;
};

export type FacetConfig = {
  label: string;
  facetField: ComplexSearchFacetsEnum;
};

export type PreSelectFacetConfig = FacetConfig & {
  type: "select";
  options: Option[];
  enableSearch: boolean;
};

export type PreRangeFacetConfig = FacetConfig & {
  type: "range";
  rangePresets: RangePreset[];
};

export type PreFacetConfig = PreSelectFacetConfig | PreRangeFacetConfig;

// Radio button filter types
export type AccessTypeFilterOptions =
  { value: "online"; label: "Online" } | { value: "fysisk"; label: "Fysisk" };
export type FictionTypeFilterOptions =
  | { value: "fiction"; label: "Fiktion" }
  | { value: "nonfiction"; label: "Non-fiktion" };
export type AgeGroupFilterOptions =
  | { value: "til voksne"; label: "Voksne" }
  | { value: "til børn"; label: "Børn" };
