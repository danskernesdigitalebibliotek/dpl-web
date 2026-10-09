import { ComplexSearchFacetsEnum } from "../dbc-gateway/generated/graphql";

export type Operator = "and" | "or" | "not";

export type FilterState = {
  term: string;
  query: string;
  operator?: Operator;
};

// Facets are filters that can be either pre-search (form selects) or post-search (sidebar filters)
export type FacetState = {
  facetField: ComplexSearchFacetsEnum;
  selectedValues: string[];
};

export enum SortOption {
  Relevance = "relevance",
  TitleAsc = "sort.title.asc",
  TitleDesc = "sort.title.desc",
  CreatorAsc = "sort.creator.asc",
  CreatorDesc = "sort.creator.desc",
  LatestPubDateAsc = "sort.latestpublicationdate.asc",
  LatestPubDateDesc = "sort.latestpublicationdate.desc"
}

export type FormView = "search" | "results";
