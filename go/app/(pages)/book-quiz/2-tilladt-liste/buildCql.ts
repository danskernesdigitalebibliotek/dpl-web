import { TAllowedEntry, entryClause } from "./allowedList"

// CQL-bygger for PoC 2: bygger led ud fra tilladt-listens poster, så hvert label
// bruger sit eget indeks (term/phrase) og sine egne FBI-værdier (én-til-mange).
// Parringen er den samme som PoC 1: genre OG (emne ELLER emne), OR'et pr. genre.

const orEntries = (entries: TAllowedEntry[]) =>
  entries.length > 1 ? `(${entries.map(entryClause).join(" OR ")})` : entryClause(entries[0])

export type TEntrySelection = {
  genres: TAllowedEntry[]
  subjects: TAllowedEntry[]
  materialTypes: TAllowedEntry[]
}

export const buildCql = ({ genres, subjects, materialTypes }: TEntrySelection): string => {
  const clauses: string[] = []

  if (genres.length > 0 && subjects.length > 0) {
    const subjectsOr = subjects.map(entryClause).join(" OR ")
    const pairs = genres.map(genre => `(${entryClause(genre)} AND (${subjectsOr}))`)
    clauses.push(pairs.length > 1 ? `(${pairs.join(" OR ")})` : pairs[0])
  } else if (genres.length > 0) {
    clauses.push(orEntries(genres))
  } else if (subjects.length > 0) {
    clauses.push(orEntries(subjects))
  }

  if (materialTypes.length > 0) {
    clauses.push(orEntries(materialTypes))
  }

  return clauses.join(" AND ")
}
