import { describe, expect, it } from "vitest";
import {
  getAvailablePriorityMaterialType,
  getManifestationBasedOnType
} from "../../apps/material/helper";
import { Manifestation, Work } from "../../core/utils/types/entities";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { Pid } from "../../core/utils/types/ids";

// Mirrors how the recommended-material component composes the two helpers:
// resolve the manifestation for the requested type, then validate it.
const priorityTypeFor = (work: Work, type?: ManifestationMaterialType) =>
  getAvailablePriorityMaterialType(
    type
      ? getManifestationBasedOnType(work, type)
      : work.manifestations.bestRepresentation,
    type
  );

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
    expect(priorityTypeFor(work, ManifestationMaterialType.ebook)).toBe(
      ManifestationMaterialType.ebook
    );
  });

  it("returns the type when another manifestation has it", () => {
    const work = workWith(bog, [bog, lydbog]);
    expect(priorityTypeFor(work, ManifestationMaterialType.audioBook)).toBe(
      ManifestationMaterialType.audioBook
    );
  });

  it("returns undefined when the work has no manifestation of that type", () => {
    const work = workWith(bog, [bog]);
    expect(
      priorityTypeFor(work, ManifestationMaterialType.ebook)
    ).toBeUndefined();
  });

  it("returns undefined when no material type is requested", () => {
    const work = workWith(bog, [bog, ebog]);
    expect(priorityTypeFor(work, undefined)).toBeUndefined();
    expect(
      priorityTypeFor(work, "" as ManifestationMaterialType)
    ).toBeUndefined();
  });
});
