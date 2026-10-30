// Delt alder/lix-filterlogik for quiz-PoC'erne. Princip:
//   BLØDT  = client-side rerank efter nærhed (gøres i hver dashboard).
//   HÅRDT  = en del af selve FBI-søgningen (CQL), så 0-hits er ægte og
//            paginering/hitcount er korrekte.
//
// CQL-syntaksen er den samme numeriske interval-syntaks som react's
// advanced-search query-builder bruger mod samme FBI-gateway:
//   alder → (ages within "9 10")   ·   lix → (lix within "0 15")
//   ét år/tal → (ages=10)
// Felterne er `ages` og `lix` (numeriske range-felter, ikke phrase).

export type TRange = [number, number]
export type TFilterMode = "soft" | "hard"

const rangeClause = (field: string, ranges: TRange[]): string => {
  if (ranges.length === 0) return ""
  const parts = ranges.map(([lo, hi]) =>
    lo === hi ? `${field}=${lo}` : `${field} within "${lo} ${hi}"`
  )
  return parts.length > 1 ? `(${parts.map(part => `(${part})`).join(" OR ")})` : `(${parts[0]})`
}

export const ageCql = (ranges: TRange[]): string => rangeClause("ages", ranges)
export const lixCql = (ranges: TRange[]): string => rangeClause("lix", ranges)

// AND'er de hårde alder/lix-filtre ind i en eksisterende CQL. Kun dimensioner i
// "hard"-tilstand ryger i CQL'en; "soft" påvirker ikke søgningen (rerankes
// client-side). Tom genre/emne-CQL ind → tom ud (ingen søgning).
export const withHardAudienceFilters = (
  cql: string,
  opts: {
    ageRanges: TRange[]
    lixRanges: TRange[]
    ageMode: TFilterMode
    lixMode: TFilterMode
  }
): string => {
  if (!cql) return cql
  const clauses = [cql]
  if (opts.ageMode === "hard") {
    const clause = ageCql(opts.ageRanges)
    if (clause) clauses.push(clause)
  }
  if (opts.lixMode === "hard") {
    const clause = lixCql(opts.lixRanges)
    if (clause) clauses.push(clause)
  }
  return clauses.join(" AND ")
}
