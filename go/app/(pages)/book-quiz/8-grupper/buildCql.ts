import { TClauseGroup, TGenreGroup, TGroupVariant, TSubjectGroup } from "./groups"

// CQL-bygger for PoC 8: i stedet for én samlet søgning bygger vi ÉN query pr.
// genregruppe, hver AND'et med ALLE de valgte emner. To genregrupper → to
// queries → to resultatlister. `variant` vælger A (genreOnly) eller B
// (genrePlusSubjects) for alle genregrupper på én gang.

// Tom term-liste (fx en pakke redigeret tom i debug) → "" (intet led), så vi
// aldrig sender "()" til FBI.
const clausesToCql = (clauses: TClauseGroup[]) => {
  const terms = clauses.flatMap(clause =>
    clause.cqlValues.filter(value => value.trim() !== "").map(value => `${clause.cqlIndex}="${value}"`)
  )
  return terms.length > 0 ? `(${terms.join(" OR ")})` : ""
}

export type TGenreResult = { group: TGenreGroup; cql: string }

export const buildQueries = (
  genreGroups: TGenreGroup[],
  subjectGroups: TSubjectGroup[],
  variant: TGroupVariant
): TGenreResult[] => {
  const emner = subjectGroups
    .map(group => clausesToCql(group.match))
    .filter(Boolean)
    .join(" OR ")
  return genreGroups.map(group => {
    const genre = clausesToCql(group[variant])
    const cql = [genre, emner ? `(${emner})` : ""].filter(Boolean).join(" AND ")
    return { group, cql }
  })
}
