import { OpensInType } from "@danskernesdigitalebibliotek/dpl-service-layer";

// Publizon's `Product.productType` is an opaque integer in the OpenAPI spec
// (see publizon-adapter.yaml). These named constants document the mapping
// we have to maintain by hand.
export const PUBLIZON_PRODUCT_TYPE = {
  EBOOK: 1,
  AUDIOBOOK: 2,
  PODCAST: 4
} as const;

export type PublizonProductType =
  (typeof PUBLIZON_PRODUCT_TYPE)[keyof typeof PUBLIZON_PRODUCT_TYPE];

// Where a Publizon material opens, from the product type its API reports;
// null for a type it does not know.
export const publizonOpensIn = (
  productType: number | null | undefined
): OpensInType | null => {
  switch (productType) {
    case PUBLIZON_PRODUCT_TYPE.EBOOK:
      return "reader";
    case PUBLIZON_PRODUCT_TYPE.AUDIOBOOK:
    case PUBLIZON_PRODUCT_TYPE.PODCAST:
      return "player";
    default:
      return null;
  }
};
