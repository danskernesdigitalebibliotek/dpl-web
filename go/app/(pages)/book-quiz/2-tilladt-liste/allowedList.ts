// Kurateret tilladt-liste for PoC 2. Hver post oversætter et børnevendt label
// til de rigtige FBI-termer via det rigtige indeks (term vs phrase) og kan dække
// flere FBI-værdier (én-til-mange). `emojis` og `score` er forberedt til PoC 4/5
// og står tomme indtil da. Termerne er trukket fra FBI's faktiske genre-/emneord.

export type TAllowedDimension = "genre" | "emne" | "materialetype"

export type TAllowedEntry = {
  label: string
  dimension: TAllowedDimension
  cqlIndex: string
  cqlValues: string[]
  emojis?: string[]
  score?: Record<string, number>
}

const genre = (label: string, cqlValues: string[], phrase = false): TAllowedEntry => ({
  label,
  dimension: "genre",
  cqlIndex: phrase ? "phrase.genreandform" : "term.genreandform",
  cqlValues,
})

const emne = (label: string, cqlValues: string[], phrase = false): TAllowedEntry => ({
  label,
  dimension: "emne",
  cqlIndex: phrase ? "phrase.subject" : "term.subject",
  cqlValues,
})

const materiale = (label: string, cqlValues: string[]): TAllowedEntry => ({
  label,
  dimension: "materialetype",
  cqlIndex: "term.specificmaterialtype",
  cqlValues,
})

export const ALLOWED_LIST: TAllowedEntry[] = [
  // Genrer — enkeltord → term, flerord → phrase, én-til-mange → flere værdier
  genre("Gys", ["gys"]),
  genre("Fantasy", ["fantasy"]),
  genre("Spænding", ["spænding"]),
  genre("Krimi", ["krimi"]),
  genre("Science fiction", ["science fiction"], true),
  genre("Dystopier", ["dystopier"]),
  genre("Eventyr", ["eventyr"]),
  genre("Eventyrlige fortællinger", ["eventyrlige fortællinger"], true),
  genre("Romaner", ["romaner"]),
  genre("Noveller", ["noveller"]),
  genre("Billedbøger", ["billedbøger"]),
  genre("Tegneserier", ["tegneserier", "manga"]),
  genre("Sjove bøger", ["sjove bøger"], true),
  genre("Humor", ["humor"]),
  genre("Young adult", ["young adult"], true),
  genre("Lydret (let at læse)", ["lydret"]),
  genre("Biografier", ["biografier"]),
  genre("Rim", ["rim"]),

  // Emner
  emne("Venskab", ["venskab", "venner", "venskaber", "veninder"]),
  emne("Kærlighed", ["kærlighed", "forelskelse", "romantisk"]),
  emne("Magi", ["magi"]),
  emne("Uhygge", ["uhyggelig", "gys"]),
  emne("Spændende", ["spændende", "action"]),
  emne("Sjov", ["sjov"]),
  emne("Dyr", ["dyr"]),
  emne("Familie", ["familien"]),
  emne("Sport", ["sport"]),
  emne("Gaming", ["gaming"]),
  emne("Piger", ["piger"]),
  emne("Drenge", ["drenge"]),
  emne("Følelser", ["følelser", "trist", "tankevækkende"]),
  emne("Identitet", ["identitet"]),
  emne("Skolen", ["skolen"]),
  emne("Historie", ["historie"]),
  emne("Eventyrlig", ["eventyrlig"]),
  emne("Mit liv", ["mit liv"], true),
  emne("Natur og miljø", ["natur og miljø"], true),
  emne("Let at læse", ["let at læse"], true),
  emne("Den store verden", ["den store verden"], true),
  emne("Ud i fremtiden", ["ud i fremtiden"], true),

  // Materialetype
  materiale("Bog", ["bog"]),
  materiale("E-bog", ["e-bog"]),
  materiale("Lydbog", ["lydbog (online)"]),
  materiale("Tegneserie", ["tegneserie"]),
]

export const entriesByDimension = (dimension: TAllowedDimension) =>
  ALLOWED_LIST.filter(entry => entry.dimension === dimension)

export const entriesFromLabels = (labels: string[]) =>
  ALLOWED_LIST.filter(entry => labels.includes(entry.label))

// Det CQL-led en post bygger — bruges både af CQL-byggeren og til at vise
// mapping label → FBI-termer i dashboardet.
export const entryClause = (entry: TAllowedEntry) =>
  `(${entry.cqlValues.map(value => `${entry.cqlIndex}="${value}"`).join(" OR ")})`
