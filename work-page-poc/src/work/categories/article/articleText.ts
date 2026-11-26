import type { Manifestation, Work } from "../../../fbi/types"
import { type AccessWay, getPublicationYear } from "./accessWays"

/** The manifestation's specific material type, e.g. "artikel (online)". Its first one, when FBI gives several. */
export const getMaterialType = (manifestation: Manifestation) =>
  manifestation.materialTypes[0]?.materialTypeSpecific.display ?? "ukendt type"

/** E.g. "Artikel (online)", as the prototype's chips and cards write the type. */
export const getMaterialTypeLabel = (manifestation: Manifestation) => {
  const materialType = getMaterialType(manifestation)
  return materialType.charAt(0).toUpperCase() + materialType.slice(1)
}

export const getManifestationTitle = (manifestation: Manifestation, work: Work) =>
  manifestation.titles.full[0] ?? work.titles.main.join(" ")

export const getCreators = (manifestation: Manifestation, work: Work) =>
  (manifestation.creators.length ? manifestation.creators : work.creators).map((creator) => creator.display).join(", ")

export const getYearLabel = (manifestation: Manifestation) => String(getPublicationYear(manifestation) ?? "ukendt år")

/** What happens when the patron takes the way: the prototype's placeholders, with the site for online links. */
export const getAccessWayText = (way: AccessWay) => {
  switch (way.kind) {
    case "read-article":
      return "Læs her med bibliotekets adgang."
    case "online":
      return `Læs med det samme på ${way.host}.`
    case "digital-copy":
      return "Modtag som PDF på e-mail."
    case "printed-issue":
      return "På hylden på biblioteket."
  }
}

export type DetailRow = { label: string; value: string }

const toRows = (rows: (DetailRow | false)[]) => rows.filter((row): row is DetailRow => row !== false)

/** What tells one edition from another, as the picker's "Se detaljer" lists it. */
export const getEditionDetailRows = (manifestation: Manifestation): DetailRow[] =>
  toRows([
    !!manifestation.hostPublication && { label: "Udgivet i", value: manifestation.hostPublication.summary },
    !!manifestation.physicalDescription?.summaryFull && {
      label: "Omfang",
      value: manifestation.physicalDescription.summaryFull,
    },
    !!manifestation.publisher.length && { label: "Forlag", value: manifestation.publisher.join(", ") },
    !!manifestation.languages?.main?.length && {
      label: "Sprog",
      value: manifestation.languages.main.map((language) => language.display).join(", "),
    },
    { label: "Kilde", value: manifestation.source.join(", ") },
  ])

/** The page's "Detaljer", leaving out what FBI doesn't have. */
export const getDetailRows = (manifestation: Manifestation, work: Work): DetailRow[] =>
  toRows([
    { label: "Type", value: getMaterialTypeLabel(manifestation) },
    { label: "Titel", value: getManifestationTitle(manifestation, work) },
    !!getCreators(manifestation, work) && { label: "Forfatter", value: getCreators(manifestation, work) },
    ...getEditionDetailRows(manifestation),
  ])

/** A line for the "Udgaver" overview, e.g. "Artikel · Slagmark, Nr. 12 (1988) · Kilde: Tidsskriftsartikler". */
export const getEditionLine = (manifestation: Manifestation) =>
  [getMaterialTypeLabel(manifestation), manifestation.hostPublication?.summary, `Kilde: ${manifestation.source.join(", ")}`]
    .filter(Boolean)
    .join(" · ")
