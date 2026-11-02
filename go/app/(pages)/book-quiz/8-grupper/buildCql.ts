import { TClauseGroup, TGenreGroup, TSubjectGroup } from "./groups"

// CQL-bygger for PoC 8: i stedet for én samlet søgning bygger vi ÉN query pr.
// genregruppe, hver AND'et med ALLE de valgte emner. To genregrupper → to
// queries → to resultatlister + en tredje liste, hvor BEGGE genregrupper
// (genre + stemning) AND'es i én søgning.

// Tom term-liste (fx en pakke redigeret tom i debug) → "" (intet led), så vi
// aldrig sender "()" til FBI.
const clausesToCql = (clauses: TClauseGroup[]) => {
  const terms = clauses.flatMap(clause =>
    clause.cqlValues
      .filter(value => value.trim() !== "")
      .map(value => `${clause.cqlIndex}="${value}"`)
  )
  return terms.length > 0 ? `(${terms.join(" OR ")})` : ""
}

export type TGenreResult = { group: TGenreGroup; cql: string }

export const buildQueries = (
  genreGroups: TGenreGroup[],
  subjectGroups: TSubjectGroup[]
): TGenreResult[] => {
  const emner = subjectGroups
    .map(group => clausesToCql(group.match))
    .filter(Boolean)
    .join(" OR ")
  const withEmner = (parts: string[]) =>
    [...parts, emner ? `(${emner})` : ""].filter(Boolean).join(" AND ")
  const results = genreGroups.map(group => ({ group, cql: withEmner([clausesToCql(group.match)]) }))
  if (genreGroups.length < 2) return results

  // Kombineret liste: en syntetisk gruppe (kun til visning) med begge grupper AND'et.
  const [first, second] = genreGroups
  const combined: TGenreGroup = {
    id: `${first.id}+${second.id}`,
    label: `${first.label} + ${second.label}`,
    emoji: `${first.emoji ?? ""}${second.emoji ?? ""}`,
    match: [],
  }
  const cql = withEmner([clausesToCql(first.match), clausesToCql(second.match)])
  return [...results, { group: combined, cql }]
}
