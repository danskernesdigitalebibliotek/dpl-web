import { describe, expect, it } from "vitest";
import { onlineInternalModalId } from "../../apps/material/helper";
import { IdentifierTypeEnum } from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { Pid } from "../../core/utils/types/ids";
import {
  getPublizonManifestation,
  getPublizonIdentifier
} from "../../core/utils/helpers/digital-loanable-manifestation";

const manifestation = (
  pid: string,
  identifiers: { type: IdentifierTypeEnum; value: string }[],
  publicationYear?: string
): Manifestation =>
  ({
    pid: pid as Pid,
    identifiers,
    ...(publicationYear && {
      edition: { publicationYear: { display: publicationYear } }
    })
  }) as unknown as Manifestation;

const pdf = manifestation("pid:pdf", [
  { type: IdentifierTypeEnum.Isbn, value: "9788797287996" }
]);
const epub = manifestation("pid:epub", [
  { type: IdentifierTypeEnum.Isbn, value: "9788797577646" },
  { type: IdentifierTypeEnum.Publizon, value: "9788797577646" }
]);

const oldEbook = manifestation(
  "pid:old-ebook",
  [{ type: IdentifierTypeEnum.Publizon, value: "9788711914717" }],
  "2019"
);
const newEbook = manifestation(
  "pid:new-ebook",
  [{ type: IdentifierTypeEnum.Publizon, value: "9788727272894" }],
  "2025"
);

describe("getPublizonManifestation", () => {
  it("prefers the newest of the loanable editions", () => {
    // Several editions of one material type can be loanable, and the reader
    // expects the newest - not whichever the data happens to list first.
    expect(
      getPublizonManifestation([oldEbook, newEbook])?.manifestation.pid
    ).toBe("pid:new-ebook");
    expect(
      getPublizonManifestation([newEbook, oldEbook])?.manifestation.pid
    ).toBe("pid:new-ebook");
  });

  it("carries the id of the manifestation it picked", () => {
    expect(getPublizonManifestation([oldEbook, newEbook])?.identifier).toBe(
      "9788727272894"
    );
  });

  it("leaves the caller's list in the order it was given", () => {
    const manifestations = [oldEbook, newEbook];
    getPublizonManifestation(manifestations);
    expect(manifestations.map(({ pid }) => pid)).toEqual([
      "pid:old-ebook",
      "pid:new-ebook"
    ]);
  });

  it("skips a manifestation without a PUBLIZON identifier", () => {
    // The deselected PDF is listed first but is not loanable.
    expect(getPublizonManifestation([pdf, epub])?.manifestation.pid).toBe(
      "pid:epub"
    );
  });

  it("returns null when no manifestation can be lent", () => {
    expect(getPublizonManifestation([pdf])).toBeNull();
    expect(getPublizonManifestation([])).toBeNull();
  });
});

// Real FBI data for "Rodløs": one e-book manifestation carrying the PUBLIZON
// value plus two ISBNs, where the first ISBN is a deselected PDF edition.
const rodloesEbook = manifestation("pid:rodloes-ebook", [
  { type: IdentifierTypeEnum.Publizon, value: "9788797577646" },
  { type: IdentifierTypeEnum.Isbn, value: "9788797287996" },
  { type: IdentifierTypeEnum.Isbn, value: "9788797577646" }
]);

describe("getPublizonIdentifier", () => {
  it("returns the PUBLIZON identifier, not the leading (deselected PDF) ISBN", () => {
    expect(getPublizonIdentifier(rodloesEbook)).toBe("9788797577646");
  });

  it("never falls back to an ISBN", () => {
    expect(getPublizonIdentifier(pdf)).toBeNull();
  });

  it("returns null without any identifier", () => {
    expect(getPublizonIdentifier(manifestation("pid:none", []))).toBeNull();
  });
});

// The two e-book editions of "Verdens farligste krokodiller". Both are
// loanable, so the 2025 one is the edition lent out.
const ebook2019 = manifestation(
  "870970-basis:46239784",
  [{ type: IdentifierTypeEnum.Publizon, value: "9788711914717" }],
  "2019"
);
const ebook2025 = manifestation(
  "870970-basis:141423606",
  [{ type: IdentifierTypeEnum.Publizon, value: "9788727272894" }],
  "2025"
);

describe("onlineInternalModalId", () => {
  const modalIdFor = (manifestations: Manifestation[]) => {
    const lendable = getPublizonManifestation(manifestations);
    return lendable && onlineInternalModalId(lendable);
  };

  it("is the id of the manifestation that is going to be lent", () => {
    // One modal is rendered per manifestation, so an opener covering several
    // editions still has to name a single one - and not the leading one.
    expect(modalIdFor([ebook2025, ebook2019])).toBe(
      "online-internal-modal-141423606"
    );
  });

  it("is the same id whether or not the set holds other editions", () => {
    expect(modalIdFor([ebook2025])).toBe("online-internal-modal-141423606");
  });
});
