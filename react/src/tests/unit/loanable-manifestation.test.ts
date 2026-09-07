import { describe, expect, it } from "vitest";
import {
  getLoanableManifestation,
  getManifestationDigitalIdentifier,
  onlineInternalModalId
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

// Real FBI data for "Rodløs": one e-book manifestation carrying the PUBLIZON
// value plus two ISBNs, where the first ISBN is a deselected PDF edition.
const rodloesEbook = manifestation("pid:rodloes-ebook", [
  { type: IdentifierTypeEnum.Publizon, value: "9788797577646" },
  { type: IdentifierTypeEnum.Isbn, value: "9788797287996" },
  { type: IdentifierTypeEnum.Isbn, value: "9788797577646" }
]);

describe("getManifestationDigitalIdentifier", () => {
  it("returns the PUBLIZON value, not the leading (deselected PDF) ISBN", () => {
    expect(getManifestationDigitalIdentifier(rodloesEbook)).toBe(
      "9788797577646"
    );
  });

  it("returns the PUBLIZON identifier value when present", () => {
    expect(getManifestationDigitalIdentifier(epub)).toBe("9788797577646");
  });

  it("falls back to the ISBN when there is no PUBLIZON identifier", () => {
    expect(getManifestationDigitalIdentifier(pdf)).toBe("9788797287996");
  });

  it("returns an empty string when there is no usable identifier", () => {
    expect(
      getManifestationDigitalIdentifier(manifestation("pid:none", []))
    ).toBe("");
  });
});

// The two e-book editions of "Verdens farligste krokodiller", where only the
// 2019 one carries a PUBLIZON identifier and is therefore the one lent out.
const ebook2019 = manifestation("870970-basis:46239784", [
  { type: IdentifierTypeEnum.Publizon, value: "9788711913451" }
]);
const ebook2025 = manifestation("870970-basis:141423606", [
  { type: IdentifierTypeEnum.Isbn, value: "9788728712054" }
]);

describe("onlineInternalModalId", () => {
  it("is the id of the edition that is going to be lent", () => {
    // One modal is rendered per manifestation, so an opener covering several
    // editions still has to name a single one - and not the leading one.
    expect(onlineInternalModalId([ebook2025, ebook2019])).toBe(
      "online-internal-modal-46239784"
    );
  });

  it("is the same id whether or not the set holds other editions", () => {
    expect(onlineInternalModalId([ebook2019])).toBe(
      "online-internal-modal-46239784"
    );
  });

  it("returns the bare prefix when there is no manifestation to lend", () => {
    expect(onlineInternalModalId([])).toBe("online-internal-modal");
  });
});
