import type { Manifestation } from "../../../fbi/types"
import { type AccessWay, accessWayLabels, getAccessWays, getPublicationYear } from "./accessWays"

/** "Anmeldelse" for reviews, "Artikel" for everything else in the category. */
export const getArticleTypeLabel = (manifestation: Manifestation) =>
  manifestation.materialTypes.some((materialType) => materialType.materialTypeSpecific.code.startsWith("REVIEW"))
    ? "Anmeldelse"
    : "Artikel"

/** E.g. "artikel og artikel (online)", as the artifact's Type field reads. */
export const getSpecificTypes = (manifestation: Manifestation) =>
  manifestation.materialTypes.map((materialType) => materialType.materialTypeSpecific.display).join(" og ")

/** The part of the host publication summary after its title, e.g. "Nr. 12 (1988)". */
export const getHostDetail = (manifestation: Manifestation) => {
  const host = manifestation.hostPublication
  if (!host) return undefined
  const prefix = `${host.title}, `
  return host.summary.startsWith(prefix) ? host.summary.slice(prefix.length) : undefined
}

const getFormatLabel = (manifestation: Manifestation) =>
  getAccessWays(manifestation).some((way) => way.kind === "online") ? "Online" : "Trykt"

/** The edition's name in the picker, e.g. "2018 · Online". */
export const getEditionTitle = (manifestation: Manifestation) =>
  [getPublicationYear(manifestation), getFormatLabel(manifestation)].filter(Boolean).join(" · ")

/** The edition's name on the page, e.g. "2018, online". */
export const getEditionValue = (manifestation: Manifestation) =>
  [getPublicationYear(manifestation), getFormatLabel(manifestation).toLowerCase()].filter(Boolean).join(", ")

export const getAccessSummary = (manifestation: Manifestation) =>
  getAccessWays(manifestation)
    .map((way) => accessWayLabels[way.kind])
    .join(" · ") || "Ingen adgang her"

/** What happens when the patron takes the way. */
export const getAccessWayText = (way: AccessWay) => {
  switch (way.kind) {
    case "online":
      return "Artiklen åbner i et nyt vindue."
    case "read-article":
      return "Artiklen åbner her på siden."
    case "digital-copy":
      return "Du får som regel artiklen som PDF på mail – ofte inden for 30 minutter, ellers inden for få dage. I enkelte tilfælde sendes en kopi til dit bibliotek."
    case "printed-issue":
      return "Artiklen står i det trykte nummer. Du kan reservere nummeret på tidsskriftets side."
  }
}

export type DetailRow = { label: string; value: string }

/** The details shown for a manifestation, leaving out what FBI doesn't have. */
export const getDetailRows = (manifestation: Manifestation): DetailRow[] => {
  const rows: (DetailRow | false)[] = [
    { label: "Type", value: getSpecificTypes(manifestation) },
    !!manifestation.creators.length && {
      label: "Bidragsydere",
      value: manifestation.creators.map((creator) => creator.display).join(", "),
    },
    !!manifestation.hostPublication && { label: "Findes i", value: manifestation.hostPublication.summary },
    !!manifestation.physicalDescription?.summaryFull && {
      label: "Omfang",
      value: manifestation.physicalDescription.summaryFull,
    },
    !!manifestation.languages?.main?.length && {
      label: "Sprog",
      value: manifestation.languages.main.map((language) => language.display).join(", "),
    },
    { label: "Adgang", value: getAccessSummary(manifestation) },
    { label: "Kilde", value: manifestation.source.join(", ") },
  ]
  return rows.filter((row): row is DetailRow => row !== false)
}
