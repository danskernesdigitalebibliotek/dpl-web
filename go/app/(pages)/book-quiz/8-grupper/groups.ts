// PoC 8: kurateringen sker i GRUPPER i stedet for løse facet-lister. En
// genre-/emnegruppe samler mange FBI-facetter under ét børnevendt navn, og hvert
// quiz-svar peger på PRÆCIS ÉN gruppe. Resultatet er to genregrupper + mange
// emner, der vises som to adskilte lister (jf. buildCql.ts).
//
// Hver gruppe har ét match: genregrupper = genre + beslægtede emne-termer
// (bredere recall), emnegrupper = emne-termer.

export type TClauseGroup = { cqlIndex: string; cqlValues: string[] }

export type TGenreGroup = {
  id: string
  label: string
  emoji?: string
  match: TClauseGroup[]
}

export type TSubjectGroup = {
  id: string
  label: string
  emoji?: string
  match: TClauseGroup[]
}

// Små hjælpere: termerne er dokumentets tilladte genre-/emneord og bruger alle
// phrase-indekset (flerord tåles). Fakta er ikke en genre men
// term.fictionnonfiction="nonfiction".
const gen = (cqlValues: string[]): TClauseGroup => ({
  cqlIndex: "phrase.genreandform",
  cqlValues,
})
const sub = (cqlValues: string[]): TClauseGroup => ({ cqlIndex: "phrase.subject", cqlValues })
const nonfiction: TClauseGroup = { cqlIndex: "term.fictionnonfiction", cqlValues: ["nonfiction"] }

// Genregrupper til de to genre-spørgsmål: overordnet genre (liste 1) og stemning
// (liste 2). Hver matcher genreandform (eller fiktion/fakta) + emner.
// Kun dokumentets termer: venner, gys og romantik har ingen genre, kun emner.
const VENNER = sub(["venner", "veninder", "venskab", "skole"])
const GYS = sub([
  "gys",
  "spøgelser",
  "zombier",
  "hekse",
  "uhyggelig",
  "uhygge",
  "monstre",
  "vampyrer",
  "varulve",
  "splatter",
  "genfærd",
  "halloween",
])
const ROMANTIK = sub([
  "kærlighed",
  "forelskelse",
  "kærester",
  "seksualitet",
  "romantisk",
  "romantik",
])

export const GENRE_GROUPS: TGenreGroup[] = [
  // --- Overordnet genre ---
  {
    id: "spaending",
    label: "Spænding",
    emoji: "💣",
    match: [gen(["spænding", "krimi"]), sub(["action", "mysterier"])],
  },
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🦄",
    match: [gen(["fantasy"])],
  },
  {
    id: "venner",
    label: "Venner",
    emoji: "👨‍👩‍👧‍👦",
    match: [VENNER],
  },
  {
    id: "fakta",
    label: "Fakta",
    emoji: "🧪",
    match: [nonfiction],
  },
  {
    id: "scifi",
    label: "Science fiction",
    emoji: "🪐",
    match: [
      gen(["science fiction"]),
      sub([
        "rumfartøjer",
        "rumrejser",
        "rummet",
        "raketter",
        "rumvæsener",
        "astronauter",
        "rumstationer",
        "månelandinger",
        "stjerner",
        "månen",
        "solsystemet",
        "rumskibe",
        "planeter",
      ]),
    ],
  },
  {
    id: "historie",
    label: "Historie",
    emoji: "🕰️",
    match: [
      gen(["historie"]),
      sub([
        "middelalderen",
        "1700-tallet",
        "1800-tallet",
        "1900-tallet",
        "verdenshistorie",
        "den 2. verdenskrig",
        "besættelsestiden",
        "mellemkrigstiden",
        "modstandbevægelsen",
        "oldtiden",
        "antikken",
        "romerriget",
        "vikingetid",
        "vikinger",
        "vikingetiden",
      ]),
    ],
  },
  {
    id: "romaner",
    label: "Romaner",
    emoji: "🙃",
    match: [gen(["romaner"])],
  },
  // --- Stemning ---
  {
    id: "sjov",
    label: "Sjov",
    emoji: "😂",
    match: [gen(["sjove bøger"]), sub(["sjov"])],
  },
  {
    id: "gys",
    label: "Gys",
    emoji: "🧟",
    match: [GYS],
  },
  {
    id: "romantik",
    label: "Romantik",
    emoji: "💘",
    match: [ROMANTIK],
  },
]

// Emnegrupper til emne-spørgsmålet.
export const SUBJECT_GROUPS: TSubjectGroup[] = [
  {
    id: "dyr",
    label: "Dyr",
    emoji: "🐰",
    match: [
      sub([
        "dyr",
        "vilde dyr",
        "pattedyr",
        "insekter",
        "øgler",
        "hunde",
        "katte",
        "kryb",
        "forhistoriske dyr",
        "kæledyr",
        "husdyr",
        "dinosaurer",
        "fugle",
        "dyreliv",
      ]),
    ],
  },
  {
    id: "gaming",
    label: "Gaming",
    emoji: "🎮",
    match: [sub(["gaming", "computerspil", "fortnite", "roblox", "minecraft"])],
  },
  {
    id: "sport",
    label: "Sport",
    emoji: "⚽",
    match: [
      sub([
        "sport",
        "fodbold",
        "tennis",
        "cykling",
        "håndbold",
        "badminton",
        "motorsport",
        "håndboldspillere",
        "fodboldspillere",
      ]),
    ],
  },
  {
    id: "klima",
    label: "Klima",
    emoji: "🌿",
    match: [
      sub([
        "klima",
        "miljø",
        "klimaændringer",
        "global opvarmning",
        "klima bevidsthed",
        "natur og miljø",
      ]),
    ],
  },
  {
    id: "andet",
    label: "Ingen af delene",
    emoji: "🤔",
    match: [sub(["krea og kultur", "mit liv"])],
  },
]

export const genreGroupById = (id: string) => GENRE_GROUPS.find(group => group.id === id)
export const subjectGroupById = (id: string) => SUBJECT_GROUPS.find(group => group.id === id)

// Fladgør en gruppes match-led til læsbare CQL-termer (bruges til debug/indsigt).
export const clauseTerms = (clauses: TClauseGroup[]): string[] =>
  clauses.flatMap(clause => clause.cqlValues.map(value => `${clause.cqlIndex}="${value}"`))
