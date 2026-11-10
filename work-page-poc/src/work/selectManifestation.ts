import type { Manifestation, Work } from "../fbi/types"
import { belongsTo, getCategory } from "./categories/registry"
import type { TraceRow, TraceSection } from "./trace"

type Selection = { manifestation: Manifestation | undefined; trace: TraceSection }

/** The default: the pick of the category FBI's best representation belongs to. */
const pickDefault = (work: Work): { manifestation?: Manifestation; rows: TraceRow[] } => {
  const { all, bestRepresentation } = work.manifestations
  const representative = all.find((manifestation) => manifestation.pid === bestRepresentation.pid) ?? all[0]
  if (!representative) return { rows: [] }

  const category = getCategory(representative)
  const { manifestation, rows } = category.pickDefault(
    all.filter((candidate) => belongsTo(category, candidate)),
    work
  )
  return {
    manifestation,
    rows: [
      {
        rule: "Standardvalget kommer fra den kategori, FBI's bedste repræsentation hører til",
        input: `manifestations.bestRepresentation.pid = ${representative.pid}`,
        outcome: `Kategori: ${category.name}`,
      },
      ...rows,
    ],
  }
}

/**
 * The manifestation the page shows: the one the URL names, or else the
 * default. The default is worked out either way, so the trace can say whether
 * the URL's choice is it; the page writes the default into the URL, so most
 * visits arrive with one.
 */
export const selectManifestation = (work: Work, manifestationId: string | null): Selection => {
  const named = work.manifestations.all.find((manifestation) => manifestation.pid === manifestationId)
  const fallback = pickDefault(work)
  const manifestation = named ?? fallback.manifestation

  const urlRow: TraceRow = {
    rule: "?manifestationId i URL'en vælger manifestationen",
    input: manifestationId ? `manifestationId = ${manifestationId}` : "manifestationId mangler",
    outcome: named ? "Findes på værket → vises" : manifestationId ? "Findes ikke på værket → standardvalg" : "Standardvalg",
  }
  const resultRow: TraceRow = {
    rule: "Den viste manifestation sammenholdt med standardvalget",
    input: `vist = ${manifestation?.pid ?? "ingen"}, standard = ${fallback.manifestation?.pid ?? "ingen"}`,
    outcome: manifestation?.pid === fallback.manifestation?.pid ? "Er standardvalget" : "Valgt i stedet for standardvalget",
  }

  return {
    manifestation,
    trace: { title: "Valgt manifestation", rows: [urlRow, ...fallback.rows, resultRow] },
  }
}
