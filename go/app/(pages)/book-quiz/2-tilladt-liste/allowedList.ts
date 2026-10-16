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
}

for (const entry of ALLOWED_LIST) {
  const emoji = EMOJI_BY_LABEL[entry.label]
  if (emoji) entry.emojis = [emoji]
}

// PoC 5 (score): hver kurateret post giver point (1-10) til ALLE læse-typer.
// Rent kuratering — ændrer ikke hvilke bøger der vises. Nøglerne matcher
// 5-score/profiles.ts (eventyrer, gyser, droemmer, opdager, griner).
const SCORE_BY_LABEL: Record<string, Record<string, number>> = {
  // Genre
  Gys: { eventyrer: 4, gyser: 10, droemmer: 2, opdager: 2, griner: 2 },
  Fantasy: { eventyrer: 9, gyser: 3, droemmer: 7, opdager: 2, griner: 3 },
  Spænding: { eventyrer: 10, gyser: 6, droemmer: 2, opdager: 3, griner: 2 },
  Krimi: { eventyrer: 7, gyser: 5, droemmer: 2, opdager: 6, griner: 2 },
  "Science fiction": { eventyrer: 8, gyser: 3, droemmer: 3, opdager: 9, griner: 2 },
  Eventyr: { eventyrer: 10, gyser: 2, droemmer: 6, opdager: 3, griner: 3 },
  Tegneserier: { eventyrer: 6, gyser: 3, droemmer: 3, opdager: 3, griner: 7 },
  "Sjove bøger": { eventyrer: 3, gyser: 1, droemmer: 2, opdager: 2, griner: 10 },
  Romaner: { eventyrer: 4, gyser: 2, droemmer: 7, opdager: 4, griner: 3 },
  Billedbøger: { eventyrer: 3, gyser: 2, droemmer: 6, opdager: 3, griner: 5 },
  // Emne
  Venskab: { eventyrer: 3, gyser: 1, droemmer: 9, opdager: 2, griner: 4 },
  Kærlighed: { eventyrer: 2, gyser: 1, droemmer: 10, opdager: 2, griner: 3 },
  Magi: { eventyrer: 7, gyser: 3, droemmer: 8, opdager: 2, griner: 3 },
  Dyr: { eventyrer: 4, gyser: 2, droemmer: 5, opdager: 7, griner: 5 },
  Familie: { eventyrer: 2, gyser: 1, droemmer: 7, opdager: 3, griner: 4 },
  Sport: { eventyrer: 7, gyser: 2, droemmer: 3, opdager: 4, griner: 4 },
  Gaming: { eventyrer: 7, gyser: 3, droemmer: 3, opdager: 4, griner: 6 },
  Følelser: { eventyrer: 2, gyser: 2, droemmer: 10, opdager: 3, griner: 2 },
  Skolen: { eventyrer: 3, gyser: 2, droemmer: 5, opdager: 4, griner: 6 },
  Historie: { eventyrer: 5, gyser: 3, droemmer: 3, opdager: 10, griner: 2 },
  "Natur og miljø": { eventyrer: 5, gyser: 1, droemmer: 3, opdager: 10, griner: 2 },
  Uhygge: { eventyrer: 4, gyser: 10, droemmer: 2, opdager: 2, griner: 2 },
}

for (const entry of ALLOWED_LIST) {
  const score = SCORE_BY_LABEL[entry.label]
  if (score) entry.score = score
}

export const entriesByDimension = (dimension: TAllowedDimension) =>
  ALLOWED_LIST.filter(entry => entry.dimension === dimension)

export const entriesFromLabels = (labels: string[]) =>
  ALLOWED_LIST.filter(entry => labels.includes(entry.label))

// Det CQL-led en post bygger — bruges både af CQL-byggeren og til at vise
// mapping label → FBI-termer i dashboardet.
export const entryClause = (entry: TAllowedEntry) =>
  `(${entry.cqlValues.map(value => `${entry.cqlIndex}="${value}"`).join(" OR ")})`
