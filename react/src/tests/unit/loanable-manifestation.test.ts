import { describe, expect, it } from "vitest";
import {
  getLoanableManifestation,
  getManifestationPublizonIdentifier
} from "../../apps/material/helper";
import { IdentifierTypeEnum } from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { Pid } from "../../core/utils/types/ids";

const manifestation = (
  pid: string,
  identifiers: { type: IdentifierTypeEnum; value: string }[]
): Manifestation =>
  ({
    pid: pid as Pid,
    identifiers
  }) as unknown as Manifestation;

const pdf = manifestation("pid:pdf", [
  { type: IdentifierTypeEnum.Isbn, value: "9788797287996" }
]);
const epub = manifestation("pid:epub", [
  { type: IdentifierTypeEnum.Isbn, value: "9788797577646" },
  { type: IdentifierTypeEnum.Publizon, value: "9788797577646" }
]);

describe("getLoanableManifestation", () => {
  it("prefers the manifestation that has a PUBLIZON identifier", () => {
    // The deselected PDF is listed first but is not loanable.
    expect(getLoanableManifestation([pdf, epub])?.pid).toBe("pid:epub");
  });

  it("falls back to the first manifestation when none has a PUBLIZON identifier", () => {
    expect(getLoanableManifestation([pdf])?.pid).toBe("pid:pdf");
  });

  it("returns null for an empty list", () => {
    expect(getLoanableManifestation([])).toBeNull();
  });
});

// Real FBI data for "Rodløs" (work-of:870970-basis:139675622): a single
// e-book manifestation carrying the PUBLIZON value plus two ISBNs, where the
// FIRST ISBN is the deselected PDF that triggered #139. The fix must return
// the PUBLIZON value, not the leading ISBN.
const rodloesEbook = manifestation("pid:rodloes-ebook", [
  { type: IdentifierTypeEnum.Publizon, value: "9788797577646" },
  { type: IdentifierTypeEnum.Isbn, value: "9788797287996" },
  { type: IdentifierTypeEnum.Isbn, value: "9788797577646" }
]);

describe("getManifestationPublizonIdentifier", () => {
  it("returns the PUBLIZON value, not the leading (deselected PDF) ISBN", () => {
    expect(getManifestationPublizonIdentifier(rodloesEbook)).toBe(
      "9788797577646"
    );
  });

  it("returns the PUBLIZON identifier value when present", () => {
    expect(getManifestationPublizonIdentifier(epub)).toBe("9788797577646");
  });

  it("falls back to the ISBN when there is no PUBLIZON identifier", () => {
    expect(getManifestationPublizonIdentifier(pdf)).toBe("9788797287996");
  });

  it("returns an empty string when there is no usable identifier", () => {
    expect(
      getManifestationPublizonIdentifier(manifestation("pid:none", []))
    ).toBe("");
  });
});
