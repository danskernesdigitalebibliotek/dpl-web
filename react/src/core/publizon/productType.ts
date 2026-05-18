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

const KNOWN_PRODUCT_TYPES = new Set<number>(
  Object.values(PUBLIZON_PRODUCT_TYPE)
);

export const isPublizonProductType = (
  value: number | null | undefined
): value is PublizonProductType =>
  value != null && KNOWN_PRODUCT_TYPES.has(value);
