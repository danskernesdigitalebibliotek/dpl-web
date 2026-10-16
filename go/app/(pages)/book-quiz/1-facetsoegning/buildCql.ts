// CQL-bygger for PoC 1 (facetsøgning). Holdt som en ren funktion, så den samme
// logik senere kan genbruges af et valideringsscript.
//
// Jf. planen: genre, emne og materialetype er hårde filtre. Lix og læsealder er
// bløde signaler og indgår IKKE i filteret — de håndteres via sortering senere.
// Parringen er: genre OG (emne ELLER emne), OR'et sammen pr. valgt genre.

export type FacetSelection = {
  genres: string[]
  subjects: string[]
  materialTypes: string[]
}

const orClause = (index: string, values: string[]) =>
  values.map(value => `${index}="${value}"`).join(" OR ")

export const buildCql = ({ genres, subjects, materialTypes }: FacetSelection): string => {
  const clauses: string[] = []

  if (genres.length > 0 && subjects.length > 0) {
    const subjectsOr = orClause("term.subject", subjects)
    const pairs = genres.map(genre => `(term.genreandform="${genre}" AND (${subjectsOr}))`)
    clauses.push(pairs.length > 1 ? `(${pairs.join(" OR ")})` : pairs[0])
  } else if (genres.length > 0) {
    clauses.push(`(${orClause("term.genreandform", genres)})`)
  } else if (subjects.length > 0) {
    clauses.push(`(${orClause("term.subject", subjects)})`)
  }

  if (materialTypes.length > 0) {
    clauses.push(`(${orClause("term.specificmaterialtype", materialTypes)})`)
  }

  return clauses.join(" AND ")
}
