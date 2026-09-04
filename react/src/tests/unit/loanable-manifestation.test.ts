import { describe, expect, it } from "vitest";
import {
  getLoanableManifestation,
  getManifestationDigitalIdentifier,
  loanableOnlineInternalModalId,
  onlineInternalModalId
} from "../../apps/material/helper";
import { getAllFaustIds } from "../../core/utils/helpers/general";
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

// The two e-book editions of "Verdens farligste krokodiller", where pressing
// "Lån e-bog" in the header used to open nothing at all.
const ebook2025 = manifestation("870970-basis:141423606", [
  { type: IdentifierTypeEnum.Publizon, value: "9788728712054" }
]);
const ebook2019 = manifestation("870970-basis:46239784", [
  { type: IdentifierTypeEnum.Isbn, value: "9788711913451" }
]);

describe("loanableOnlineInternalModalId", () => {
  it("asks for the modal of the edition that is going to be lent", () => {
    // One modal is rendered per manifestation, so this has to be the id of a
    // single edition - the one carrying the PUBLIZON identifier.
    expect(loanableOnlineInternalModalId([ebook2019, ebook2025])).toBe(
      onlineInternalModalId(getAllFaustIds([ebook2025]))
    );
    expect(loanableOnlineInternalModalId([ebook2019, ebook2025])).toBe(
      "online-internal-modal-141423606"
    );
  });

  it("does not build an id out of the whole set of editions", () => {
    // No modal is rendered under a combined id, so opening it did nothing.
    expect(loanableOnlineInternalModalId([ebook2019, ebook2025])).not.toBe(
      onlineInternalModalId(getAllFaustIds([ebook2019, ebook2025]))
    );
  });

  it("is unchanged for a work with a single edition", () => {
    expect(loanableOnlineInternalModalId([ebook2025])).toBe(
      onlineInternalModalId(getAllFaustIds([ebook2025]))
    );
  });

  it("returns the bare prefix when there is no manifestation to lend", () => {
    expect(loanableOnlineInternalModalId([])).toBe("online-internal-modal");
  });
});
