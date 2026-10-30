import { TClauseGroup, TGenreGroup, TGroupVariant, TSubjectGroup } from "./groups"

// CQL-bygger for PoC 8: i stedet for én samlet søgning bygger vi ÉN query pr.
// genregruppe, hver AND'et med ALLE de valgte emner. To genregrupper → to
// queries → to resultatlister. `variant` vælger A (genreOnly) eller B
// (genrePlusSubjects) for alle genregrupper på én gang.

const clausesToCql = (clauses: TClauseGroup[]) =>
  "(" + clauses.flatMap(clause => clause.cqlValues.map(value => `${clause.cqlIndex}="${value}"`)).join(" OR ") + ")"

export type TGenreResult = { group: TGenreGroup; cql: string }

export const buildQueries = (
  genreGroups: TGenreGroup[],
  subjectGroups: TSubjectGroup[],
  variant: TGroupVariant
): TGenreResult[] => {
  const emner = subjectGroups.map(group => clausesToCql(group.match)).join(" OR ")
  return genreGroups.map(group => {
    const genre = clausesToCql(group[variant])
    const cql = emner ? `${genre} AND (${emner})` : genre
    return { group, cql }
  })
}
