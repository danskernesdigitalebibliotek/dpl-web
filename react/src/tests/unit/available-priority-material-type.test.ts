import { describe, expect, it } from "vitest";
import { getAvailablePriorityMaterialType } from "../../apps/material/helper";
import { Manifestation, Work } from "../../core/utils/types/entities";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { Pid } from "../../core/utils/types/ids";

const manifestation = (
  pid: string,
  type: ManifestationMaterialType,
  year: string
): Manifestation =>
  ({
    pid: pid as Pid,
    materialTypes: [{ materialTypeSpecific: { display: type } }],
    edition: { publicationYear: { display: year } }
  }) as unknown as Manifestation;

const workWith = (
  bestRepresentation: Manifestation,
  all: Manifestation[]
): Work =>
  ({
    manifestations: { bestRepresentation, all }
  }) as unknown as Work;

describe("getAvailablePriorityMaterialType", () => {
  const ebog = manifestation(
    "pid:ebog",
    ManifestationMaterialType.ebook,
    "2020"
  );
  const bog = manifestation("pid:bog", ManifestationMaterialType.book, "2019");
  const lydbog = manifestation(
    "pid:lydbog",
    ManifestationMaterialType.audioBook,
    "2021"
  );

  it("returns the type when the best representation already matches it", () => {
    const work = workWith(ebog, [ebog, bog]);
    expect(
      getAvailablePriorityMaterialType(work, ManifestationMaterialType.ebook)
    ).toBe(ManifestationMaterialType.ebook);
  });

  it("returns the type when another manifestation has it", () => {
    const work = workWith(bog, [bog, lydbog]);
    expect(
      getAvailablePriorityMaterialType(
        work,
        ManifestationMaterialType.audioBook
      )
    ).toBe(ManifestationMaterialType.audioBook);
  });

  it("returns undefined when the work has no manifestation of that type", () => {
    const work = workWith(bog, [bog]);
    expect(
      getAvailablePriorityMaterialType(work, ManifestationMaterialType.ebook)
    ).toBeUndefined();
  });

  it("returns undefined when no material type is requested", () => {
    const work = workWith(bog, [bog, ebog]);
    expect(getAvailablePriorityMaterialType(work, undefined)).toBeUndefined();
    expect(
      getAvailablePriorityMaterialType(work, "" as ManifestationMaterialType)
    ).toBeUndefined();
  });
});
