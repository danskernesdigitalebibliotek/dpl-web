import { describe, expect, it } from "vitest";
import {
  getReaderPlayerType,
  getReaderPlayerTypeFromPublizonProductType
} from "../../components/reader-player/helper";
import {
  PUBLIZON_PRODUCT_TYPE,
  PublizonProductType
} from "../../core/publizon/productType";
import { IdentifierTypeEnum } from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { Pid } from "../../core/utils/types/ids";

const manifestation = ({
  materialType,
  hasEreolAccess,
  hasDigitalIdentifier
}: {
  materialType: string;
  hasEreolAccess: boolean;
  hasDigitalIdentifier: boolean;
}): Manifestation =>
  ({
    pid: "pid:test" as Pid,
    access: hasEreolAccess
      ? [{ __typename: "Ereol" }]
      : [{ __typename: "AccessUrl" }],
    identifiers: [
      { type: IdentifierTypeEnum.Isbn, value: "9788797287996" },
      ...(hasDigitalIdentifier
        ? [{ type: IdentifierTypeEnum.Publizon, value: "9788797577646" }]
        : [])
    ],
    materialTypes: [{ materialTypeSpecific: { display: materialType } }]
  }) as unknown as Manifestation;

describe("getReaderPlayerType", () => {
  it("opens an e-book in the reader and an audiobook in the player", () => {
    expect(
      getReaderPlayerType(
        manifestation({
          materialType: "e-bog",
          hasEreolAccess: true,
          hasDigitalIdentifier: true
        })
      )
    ).toBe("reader");
    expect(
      getReaderPlayerType(
        manifestation({
          materialType: "lydbog (online)",
          hasEreolAccess: true,
          hasDigitalIdentifier: true
        })
      )
    ).toBe("player");
  });

  it("offers neither without a digital identifier", () => {
    // The ISBN beside it is not a stand-in. Answering "reader" here would
    // route the buttons into a branch that can only render nothing, past the
    // external link they would otherwise fall through to.
    expect(
      getReaderPlayerType(
        manifestation({
          materialType: "e-bog",
          hasEreolAccess: true,
          hasDigitalIdentifier: false
        })
      )
    ).toBeNull();
  });

  it("offers neither without the e-book service access", () => {
    expect(
      getReaderPlayerType(
        manifestation({
          materialType: "e-bog",
          hasEreolAccess: false,
          hasDigitalIdentifier: true
        })
      )
    ).toBeNull();
  });
});

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
