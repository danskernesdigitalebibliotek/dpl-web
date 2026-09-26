export type FacetLineItem<TType extends "facet" | "term"> = {
  title: string;
  type: TType;
  score: TType extends "term" ? number : never;
  facet: TType extends "term" ? string : never;
  terms: TType extends "facet" ? FacetLineItem<"term">[] : never;
};
