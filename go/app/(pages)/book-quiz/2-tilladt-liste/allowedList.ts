// Kurateret tilladt-liste for PoC 2. Hver post oversætter et børnevendt label
// til de rigtige FBI-termer via det rigtige indeks (term vs phrase) og kan dække
// flere FBI-værdier (én-til-mange). `emojis` og `score` er forberedt til PoC 4/5
// og står tomme indtil da. Termerne er trukket fra FBI's faktiske genre-/emneord.

export type TAllowedDimension = "genre" | "emne" | "materialetype"

// En ekstra CQL-gruppe (ét indeks + værdier) som et option også kan matche på —
// fx en genre der også rammes som emne. OR'es ind i entryClause (én-til-mange på
// tværs af indekser).
export type TClauseGroup = { cqlIndex: string; cqlValues: string[] }

export type TAllowedEntry = {
  label: string
  dimension: TAllowedDimension
  cqlIndex: string
  cqlValues: string[]
  extra?: TClauseGroup[]
  emojis?: string[]
  score?: Record<string, number>
  // Alderssvarende interval (bruges til at gate valg efter barnets alder i
  // quizzen — ikke et CQL-filter). Ingen grænse = egnet for alle aldre.
  minAge?: number
  maxAge?: number
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

// Ekstra match-grupper (bruges i EXTRA_BY_LABEL). term = enkeltord, phrase = flerord.
const subTerms = (values: string[]): TClauseGroup => ({
  cqlIndex: "term.subject",
  cqlValues: values,
})
const genTerms = (values: string[]): TClauseGroup => ({
  cqlIndex: "term.genreandform",
  cqlValues: values,
})
const genPhrase = (values: string[]): TClauseGroup => ({
  cqlIndex: "phrase.genreandform",
  cqlValues: values,
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
  genre("Digte", ["digte"]),
  genre("Dagbøger", ["dagbøger"]),
  genre("Dyrefortællinger", ["dyrefortællinger"]),
  genre("Godnathistorier", ["godnathistorier"]),
  genre("Pegebøger", ["pegebøger"]),
  genre("Historiske romaner", ["historiske romaner"], true),
  genre("Fantastiske fortællinger", ["fantastiske fortællinger"], true),
  genre("Dark fantasy", ["dark fantasy"], true),

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
  emne("Danmark", ["danmark"]),
  emne("Krea og kultur", ["krea og kultur"], true),
  emne("Hyggeligt", ["rar"]),

  // Materialetype
  materiale("Bog", ["bog"]),
  materiale("E-bog", ["e-bog"]),
  materiale("Lydbog", ["lydbog (online)"]),
  materiale("Tegneserie", ["tegneserie"]),
]

// PoC 4 (emoji): fylder det reserverede `emojis`-felt på en kurateret delmængde
// af genre- og emne-posterne. Kun poster med en emoji er med i emoji-quizzen;
// PoC 2/3 ignorerer feltet.
const EMOJI_BY_LABEL: Record<string, string> = {
  // Genre
  Gys: "👻",
  Fantasy: "🧙",
  Spænding: "😱",
  Krimi: "🕵️",
  "Science fiction": "🚀",
  Eventyr: "🏰",
  Tegneserier: "💥",
  "Sjove bøger": "😂",
  Romaner: "📖",
  Billedbøger: "🖼️",
  Digte: "🪶",
  Dagbøger: "📔",
  Dyrefortællinger: "🦊",
  Godnathistorier: "🌙",
  Pegebøger: "👶",
  "Historiske romaner": "🏛️",
  "Fantastiske fortællinger": "🌟",
  "Dark fantasy": "🌑",
  // Emne
  Venskab: "🤝",
  Kærlighed: "❤️",
  Magi: "✨",
  Dyr: "🐾",
  Familie: "👨‍👩‍👧",
  Sport: "⚽",
  Gaming: "🎮",
  Følelser: "😢",
  Skolen: "🏫",
  Historie: "📜",
  "Natur og miljø": "🌿",
  Uhygge: "🕷️",
  Danmark: "🇩🇰",
  "Krea og kultur": "🎨",
  Hyggeligt: "🧸",
}

for (const entry of ALLOWED_LIST) {
  const emoji = EMOJI_BY_LABEL[entry.label]
  if (emoji) entry.emojis = [emoji]
}

// PoC 5 (score): hver kurateret post giver point (1-10) til ALLE læse-typer.
// Rent kuratering — ændrer ikke hvilke bøger der vises. Nøglerne matcher
// 5-score/profiles.ts (eventyrer, gyser, droemmer, opdager, griner).
const SCORE_BY_LABEL: Record<string, Record<string, number>> = {
  // Genre — hver post "ejes" tydeligt af én læsetype (høj), så fordelingen
  // bliver jævn. eventyrer=Eventyreren, gyser=Den modige, droemmer=Drømmeren,
  // opdager=Opdageren, griner=Grineren.
  Gys: { eventyrer: 2, gyser: 10, droemmer: 1, opdager: 1, griner: 1 },
  Fantasy: { eventyrer: 6, gyser: 2, droemmer: 9, opdager: 2, griner: 2 },
  Spænding: { eventyrer: 10, gyser: 6, droemmer: 2, opdager: 3, griner: 1 },
  Krimi: { eventyrer: 5, gyser: 3, droemmer: 1, opdager: 9, griner: 1 },
  "Science fiction": { eventyrer: 5, gyser: 2, droemmer: 2, opdager: 9, griner: 1 },
  Eventyr: { eventyrer: 10, gyser: 2, droemmer: 5, opdager: 2, griner: 2 },
  Tegneserier: { eventyrer: 3, gyser: 1, droemmer: 2, opdager: 2, griner: 10 },
  "Sjove bøger": { eventyrer: 1, gyser: 1, droemmer: 1, opdager: 1, griner: 10 },
  Romaner: { eventyrer: 2, gyser: 1, droemmer: 9, opdager: 4, griner: 2 },
  Billedbøger: { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 2, griner: 5 },
  Digte: { eventyrer: 2, gyser: 1, droemmer: 9, opdager: 3, griner: 2 },
  Dagbøger: { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 2, griner: 5 },
  Dyrefortællinger: { eventyrer: 3, gyser: 1, droemmer: 5, opdager: 8, griner: 3 },
  Godnathistorier: { eventyrer: 2, gyser: 1, droemmer: 9, opdager: 2, griner: 3 },
  Pegebøger: { eventyrer: 2, gyser: 1, droemmer: 7, opdager: 2, griner: 5 },
  "Historiske romaner": { eventyrer: 3, gyser: 1, droemmer: 3, opdager: 10, griner: 1 },
  "Fantastiske fortællinger": { eventyrer: 9, gyser: 2, droemmer: 6, opdager: 2, griner: 2 },
  "Dark fantasy": { eventyrer: 5, gyser: 9, droemmer: 3, opdager: 2, griner: 1 },
  Dystopier: { eventyrer: 4, gyser: 5, droemmer: 2, opdager: 9, griner: 1 },
  "Eventyrlige fortællinger": { eventyrer: 9, gyser: 2, droemmer: 4, opdager: 2, griner: 2 },
  Noveller: { eventyrer: 3, gyser: 2, droemmer: 4, opdager: 7, griner: 2 },
  Humor: { eventyrer: 2, gyser: 1, droemmer: 2, opdager: 1, griner: 10 },
  "Young adult": { eventyrer: 3, gyser: 2, droemmer: 8, opdager: 5, griner: 2 },
  "Lydret (let at læse)": { eventyrer: 2, gyser: 1, droemmer: 5, opdager: 2, griner: 7 },
  Biografier: { eventyrer: 2, gyser: 1, droemmer: 3, opdager: 10, griner: 1 },
  Rim: { eventyrer: 2, gyser: 1, droemmer: 5, opdager: 1, griner: 8 },
  // Emne
  Venskab: { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 2, griner: 3 },
  Kærlighed: { eventyrer: 1, gyser: 1, droemmer: 9, opdager: 1, griner: 2 },
  Magi: { eventyrer: 5, gyser: 2, droemmer: 8, opdager: 2, griner: 2 },
  Dyr: { eventyrer: 3, gyser: 1, droemmer: 4, opdager: 8, griner: 3 },
  Familie: { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 2, griner: 3 },
  Sport: { eventyrer: 9, gyser: 2, droemmer: 2, opdager: 3, griner: 4 },
  Gaming: { eventyrer: 7, gyser: 2, droemmer: 2, opdager: 3, griner: 6 },
  Følelser: { eventyrer: 2, gyser: 1, droemmer: 9, opdager: 2, griner: 2 },
  Skolen: { eventyrer: 2, gyser: 1, droemmer: 4, opdager: 3, griner: 8 },
  Historie: { eventyrer: 3, gyser: 1, droemmer: 2, opdager: 10, griner: 1 },
  "Natur og miljø": { eventyrer: 3, gyser: 1, droemmer: 2, opdager: 10, griner: 2 },
  Uhygge: { eventyrer: 2, gyser: 10, droemmer: 2, opdager: 1, griner: 1 },
  Danmark: { eventyrer: 3, gyser: 1, droemmer: 2, opdager: 9, griner: 2 },
  "Krea og kultur": { eventyrer: 2, gyser: 1, droemmer: 4, opdager: 7, griner: 5 },
  Hyggeligt: { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 2, griner: 5 },
  Spændende: { eventyrer: 10, gyser: 4, droemmer: 2, opdager: 3, griner: 1 },
  Sjov: { eventyrer: 2, gyser: 1, droemmer: 2, opdager: 1, griner: 10 },
  Piger: { eventyrer: 3, gyser: 1, droemmer: 7, opdager: 2, griner: 3 },
  Drenge: { eventyrer: 7, gyser: 2, droemmer: 3, opdager: 2, griner: 3 },
  Identitet: { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 5, griner: 2 },
  Eventyrlig: { eventyrer: 9, gyser: 2, droemmer: 4, opdager: 2, griner: 2 },
  "Mit liv": { eventyrer: 2, gyser: 1, droemmer: 8, opdager: 3, griner: 3 },
  "Let at læse": { eventyrer: 2, gyser: 1, droemmer: 4, opdager: 2, griner: 7 },
  "Den store verden": { eventyrer: 4, gyser: 1, droemmer: 2, opdager: 9, griner: 2 },
  "Ud i fremtiden": { eventyrer: 5, gyser: 2, droemmer: 2, opdager: 8, griner: 1 },
}

for (const entry of ALLOWED_LIST) {
  const score = SCORE_BY_LABEL[entry.label]
  if (score) entry.score = score
}

// Ekstra CQL-match pr. option: bredere recall ved at matche flere beslægtede
// FBI-termer — men KUN inden for postens egen dimension (genrer udvides med
// flere genreandform-termer, emner med flere subject-termer). Genre og emne
// blandes aldrig. OR'es ind i entryClause ud over postens primære indeks.
const EXTRA_BY_LABEL: Record<string, TClauseGroup[]> = {
  // Genrer — flere beslægtede genre-termer
  Fantasy: [genPhrase(["fantastiske fortællinger", "dark fantasy"])],
  Gys: [genTerms(["splatter"])],
  "Science fiction": [genTerms(["dystopier", "fremtidsfortællinger"])],
  Eventyr: [genPhrase(["eventyrlige fortællinger"])],
  "Sjove bøger": [genTerms(["humor"])],
  // Emner — flere beslægtede emne-termer
  Magi: [subTerms(["eventyrlig", "fantasy"])],
}

for (const entry of ALLOWED_LIST) {
  const extra = EXTRA_BY_LABEL[entry.label]
  if (extra) entry.extra = extra
}

// Alderssvarende interval pr. genre/emne — bruges til at gate valg efter
// barnets alder (fx Gys/Krimi ikke for de yngste; Billedbøger ikke for de
// ældste). Poster uden grænse er egnet for alle aldre.
const AGE_BY_LABEL: Record<string, { min?: number; max?: number }> = {
  // Genrer
  Pegebøger: { max: 6 },
  Billedbøger: { max: 9 },
  Godnathistorier: { max: 9 },
  Rim: { max: 9 },
  Gys: { min: 9 },
  Krimi: { min: 9 },
  "Science fiction": { min: 9 },
  Dystopier: { min: 11 },
  "Dark fantasy": { min: 11 },
  "Young adult": { min: 12 },
  Biografier: { min: 10 },
  // Emner
  Uhygge: { min: 9 },
  Kærlighed: { min: 9 },
  Gaming: { min: 8 },
  Identitet: { min: 10 },
}

for (const entry of ALLOWED_LIST) {
  const age = AGE_BY_LABEL[entry.label]
  if (age) {
    if (age.min != null) entry.minAge = age.min
    if (age.max != null) entry.maxAge = age.max
  }
}

export const entriesByDimension = (dimension: TAllowedDimension) =>
  ALLOWED_LIST.filter(entry => entry.dimension === dimension)

export const entriesFromLabels = (labels: string[]) =>
  ALLOWED_LIST.filter(entry => labels.includes(entry.label))

// Det CQL-led en post bygger — bruges både af CQL-byggeren og til at vise
// mapping label → FBI-termer i dashboardet.
export const entryClause = (entry: TAllowedEntry) => {
  const groups: TClauseGroup[] = [
    { cqlIndex: entry.cqlIndex, cqlValues: entry.cqlValues },
    ...(entry.extra ?? []),
  ]
  const clauses = groups.flatMap(group =>
    group.cqlValues.map(value => `${group.cqlIndex}="${value}"`)
  )
  return `(${clauses.join(" OR ")})`
}
