import { describe, expect, it } from "vitest";
import { getReaderPlayerTypeFromPublizonProductType } from "../../components/reader-player/helper";
import {
  PUBLIZON_PRODUCT_TYPE,
  PublizonProductType
} from "../../core/publizon/productType";

describe("getReaderPlayerTypeFromPublizonProductType", () => {
  it('returns "reader" for ebooks', () => {
    expect(
      getReaderPlayerTypeFromPublizonProductType(PUBLIZON_PRODUCT_TYPE.EBOOK)
    ).toBe("reader");
  });

  it('returns "player" for audiobooks', () => {
    expect(
      getReaderPlayerTypeFromPublizonProductType(
        PUBLIZON_PRODUCT_TYPE.AUDIOBOOK
      )
    ).toBe("player");
  });

  it('returns "player" for podcasts', () => {
    expect(
      getReaderPlayerTypeFromPublizonProductType(PUBLIZON_PRODUCT_TYPE.PODCAST)
    ).toBe("player");
  });

  it("returns null for null/undefined product type", () => {
    expect(getReaderPlayerTypeFromPublizonProductType(null)).toBeNull();
    expect(getReaderPlayerTypeFromPublizonProductType(undefined)).toBeNull();
  });

  it("returns null for unknown product type", () => {
    expect(
      getReaderPlayerTypeFromPublizonProductType(999 as PublizonProductType)
    ).toBeNull();
  });
});
