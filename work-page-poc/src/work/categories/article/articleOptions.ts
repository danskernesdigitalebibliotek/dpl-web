import type { Manifestation } from "../../../fbi/types"
import type { TraceRow } from "../../trace"
import { type AccessWay, accessWayLabels, evaluateAccess, getPublicationYear, rankEditions } from "./accessWays"
import { getMaterialType, getMaterialTypeLabel } from "./articleText"

/** An edition and the ways to it the patron can take. */
export type EditionWithWays = { manifestation: Manifestation; ways: AccessWay[] }

export type MaterialTypeChoice = {
  label: string
  isSelected: boolean
  /** Where the type's chip leads: the type's default edition. */
  defaultManifestation: Manifestation
}

type SwitchMode = "none" | "edition" | "access-way" | "edition-and-access-way"

const switchTexts: Record<SwitchMode, string | undefined> = {
  none: undefined,
  edition: "Skift udgave",
  "access-way": "Skift bestillingsmulighed",
  "edition-and-access-way": "Skift udgave eller bestilling",
}

const pickerTitles: Record<SwitchMode, string> = {
  none: "Vælg udgave",
  edition: "Vælg udgave",
  "access-way": "Bestillingsmuligheder",
  "edition-and-access-way": "Udgaver og bestillingsmuligheder",
}

export const optionRules = {
  materialType: "Hver materialetype (materialTypeSpecific) får en knap; en manifestation med flere typer hører til sin første",
  typeDefault: "En typeknap viser typens standardudgave",
  residency: "Læs artikel skjules for lånere, der ikke bor i bibliotekets kommune",
  selectedWay: "accessWay i URL'en vælger adgangsvejen; ellers vises udgavens bedste",
  switchText: `Skift-linket nævner det, der kan skiftes inden for typen: ${Object.values(switchTexts).filter(Boolean).join(" / ")}`,
  picker: "Vælgeren viser udgaverne af den valgte type, nyeste først, med deres adgangsveje",
}

const getSwitchMode = (hasSeveralEditions: boolean, hasSeveralWays: boolean): SwitchMode => {
  if (hasSeveralEditions && hasSeveralWays) return "edition-and-access-way"
  if (hasSeveralEditions) return "edition"
  if (hasSeveralWays) return "access-way"
  return "none"
}

const describeWayChoice = (selectedWayLabel: string | undefined, isRequested: boolean, hasRequest: boolean) => {
  if (!selectedWayLabel) return "Ingen adgangsvej"
  if (isRequested) return `Findes på udgaven → ${selectedWayLabel}`
  if (hasRequest) return `Findes ikke på udgaven → bedste: ${selectedWayLabel}`
  return `Bedste: ${selectedWayLabel}`
}

const sortNewestFirst = (manifestations: Manifestation[]) =>
  [...manifestations].sort((first, second) => (getPublicationYear(second) ?? 0) - (getPublicationYear(first) ?? 0))

const groupByMaterialType = (manifestations: Manifestation[]) => {
  const groups = new Map<string, Manifestation[]>()
  sortNewestFirst(manifestations).forEach((manifestation) => {
    const materialType = getMaterialType(manifestation)
    groups.set(materialType, [...(groups.get(materialType) ?? []), manifestation])
  })
  return groups
}

type ArticleOptionsInput = {
  manifestation: Manifestation
  categoryManifestations: Manifestation[]
  requestedWay: string | null
  isResident: boolean | undefined
}

/**
 * What the patron can choose between: the material types, the editions of
 * the shown type with their ways, and the way shown. The page renders the
 * result, and the debug panel renders the trace of the same call.
 */
export const resolveArticleOptions = ({
  manifestation,
  categoryManifestations,
  requestedWay,
  isResident,
}: ArticleOptionsInput) => {
  const getWays = (candidate: Manifestation) =>
    evaluateAccess(candidate).ways.filter((way) => !(way.kind === "read-article" && isResident === false))

  const groups = groupByMaterialType(categoryManifestations)
  const shownType = getMaterialType(manifestation)
  const materialTypes = [...groups.entries()].map(
    ([materialType, manifestations]): MaterialTypeChoice => ({
      label: getMaterialTypeLabel(manifestations[0]),
      isSelected: materialType === shownType,
      defaultManifestation: rankEditions(manifestations).ranked[0],
    })
  )
  const typeRows = [...groups.entries()].map(
    ([materialType, manifestations], index): TraceRow => ({
      rule: materialType === shownType ? optionRules.materialType : optionRules.typeDefault,
      input: `materialTypes[0].materialTypeSpecific.display = ${materialType}: ${manifestations.map((candidate) => candidate.pid).join(", ")}`,
      outcome:
        materialType === shownType
          ? "Valgt: den viste manifestations type"
          : `Knap → ${materialTypes[index].defaultManifestation.pid}`,
    })
  )

  const editions = sortNewestFirst(groups.get(shownType) ?? [manifestation]).map(
    (candidate): EditionWithWays => ({ manifestation: candidate, ways: getWays(candidate) })
  )

  const access = evaluateAccess(manifestation)
  const ways = getWays(manifestation)
  const hasRetriever = access.ways.some((way) => way.kind === "read-article")
  const residencyRows: TraceRow[] = hasRetriever
    ? [
        {
          rule: optionRules.residency,
          input: `usePatron().isResident = ${isResident ?? "(ingen låner)"}`,
          outcome: isResident === false ? "Læs artikel skjult" : "Læs artikel vises",
        },
      ]
    : []

  const requested = ways.find((way) => way.kind === requestedWay)
  const selectedWay = requested ?? ways[0]
  const selectedWayLabel = selectedWay ? accessWayLabels[selectedWay.kind] : undefined
  const wayRow: TraceRow = {
    rule: optionRules.selectedWay,
    input: requestedWay ? `accessWay = ${requestedWay}` : "accessWay mangler",
    outcome: describeWayChoice(selectedWayLabel, Boolean(requested), Boolean(requestedWay)),
  }

  const hasSeveralEditions = editions.length > 1
  const editionsWithSeveralWays = editions.filter((edition) => edition.ways.length > 1).length
  const switchMode = getSwitchMode(hasSeveralEditions, editionsWithSeveralWays > 0)
  const switchText = switchTexts[switchMode]
  const pickerTitle = pickerTitles[switchMode]
  const switchRow: TraceRow = {
    rule: optionRules.switchText,
    input: `${editions.length} udgave(r) af typen ${shownType}, ${editionsWithSeveralWays} med flere adgangsveje`,
    outcome: switchText ? `"${switchText}", vælgerens titel "${pickerTitle}"` : "Intet at skifte → intet link",
  }

  return {
    materialTypes,
    editions,
    selectedWay,
    switchText,
    pickerTitle,
    applyLabel: switchMode === "edition" ? "Vælg udgave" : "Vælg",
    typeRows,
    accessRows: [...access.rows, ...residencyRows],
    choiceRows: [wayRow, switchRow],
  }
}
