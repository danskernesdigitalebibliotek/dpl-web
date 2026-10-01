import { describe, expect, it } from "vitest";
import {
  publizonOpensIn,
  PUBLIZON_PRODUCT_TYPE
} from "../../core/publizon/productType";

describe("publizonOpensIn", () => {
  it("opens an e-book in the reader", () => {
    expect(publizonOpensIn(PUBLIZON_PRODUCT_TYPE.EBOOK)).toBe("reader");
  });

  it.each([PUBLIZON_PRODUCT_TYPE.AUDIOBOOK, PUBLIZON_PRODUCT_TYPE.PODCAST])(
    "opens product type %i in the player",
    (productType) => {
      expect(publizonOpensIn(productType)).toBe("player");
    }
  );

  it.each([null, undefined, 999])("opens %s in nothing", (productType) => {
    expect(publizonOpensIn(productType)).toBeNull();
  });
});
