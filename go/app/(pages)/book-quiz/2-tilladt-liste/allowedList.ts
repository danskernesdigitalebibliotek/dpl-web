// Kurateret tilladt-liste for PoC 2. Hver post oversætter et børnevendt label
// til de rigtige FBI-termer via det rigtige indeks (term vs phrase) og kan dække
// flere FBI-værdier (én-til-mange). `emojis` og `score` er forberedt til PoC 4/5
// og står tomme indtil da.

export type TAllowedDimension = "genre" | "emne" | "materialetype"

export type TAllowedEntry = {
  label: string
  dimension: TAllowedDimension
  cqlIndex: string
  cqlValues: string[]
  emojis?: string[]
  score?: Record<string, number>
}

export const ALLOWED_LIST: TAllowedEntry[] = [
  // Genrer (enkeltord → term, flerord → phrase, én-til-mange → flere værdier)
  { label: "Gys", dimension: "genre", cqlIndex: "term.genreandform", cqlValues: ["gys"] },
  { label: "Fantasy", dimension: "genre", cqlIndex: "term.genreandform", cqlValues: ["fantasy"] },
  { label: "Spænding", dimension: "genre", cqlIndex: "term.genreandform", cqlValues: ["spænding"] },
  {
    label: "Sjove bøger",
    dimension: "genre",
    cqlIndex: "phrase.genreandform",
    cqlValues: ["sjove bøger"],
  },
  {
    label: "Tegneserier",
    dimension: "genre",
    cqlIndex: "term.genreandform",
    cqlValues: ["tegneserier", "manga"],
  },

  // Emner
  {
    label: "Venskab",
    dimension: "emne",
    cqlIndex: "term.subject",
    cqlValues: ["venskab", "venner"],
  },
  { label: "Magi", dimension: "emne", cqlIndex: "term.subject", cqlValues: ["magi"] },
  { label: "Uhygge", dimension: "emne", cqlIndex: "term.subject", cqlValues: ["uhyggelig"] },
  {
    label: "Kærlighed",
    dimension: "emne",
    cqlIndex: "term.subject",
    cqlValues: ["kærlighed", "forelskelse"],
  },
  { label: "Mit liv", dimension: "emne", cqlIndex: "phrase.subject", cqlValues: ["mit liv"] },
  { label: "Dyr", dimension: "emne", cqlIndex: "term.subject", cqlValues: ["dyr"] },

  // Materialetype
  { label: "Bog", dimension: "materialetype", cqlIndex: "term.specificmaterialtype", cqlValues: ["bog"] },
  {
    label: "E-bog",
    dimension: "materialetype",
    cqlIndex: "term.specificmaterialtype",
    cqlValues: ["e-bog"],
  },
  {
    label: "Lydbog",
    dimension: "materialetype",
    cqlIndex: "term.specificmaterialtype",
    cqlValues: ["lydbog (online)"],
  },
]

export const entriesByDimension = (dimension: TAllowedDimension) =>
  ALLOWED_LIST.filter(entry => entry.dimension === dimension)

export const entriesFromLabels = (labels: string[]) =>
  ALLOWED_LIST.filter(entry => labels.includes(entry.label))

// Det CQL-led en post bygger — bruges både af CQL-byggeren og til at vise
// mapping label → FBI-termer i dashboardet.
export const entryClause = (entry: TAllowedEntry) =>
  `(${entry.cqlValues.map(value => `${entry.cqlIndex}="${value}"`).join(" OR ")})`
