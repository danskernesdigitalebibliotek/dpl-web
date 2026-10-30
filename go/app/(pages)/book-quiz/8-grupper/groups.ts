// PoC 8: kurateringen sker i GRUPPER i stedet for løse facet-lister. En
// genre-/emnegruppe samler mange FBI-facetter under ét børnevendt navn, og hvert
// quiz-svar peger på PRÆCIS ÉN gruppe. Resultatet er to genregrupper + mange
// emner, der vises som to adskilte lister (jf. buildCql.ts).
//
// Hver GENREGRUPPE findes i to variationer, så de kan A/B-sammenlignes:
//   A ("genreOnly")        — rent genreandform (smal, præcis)
//   B ("genrePlusSubjects") — genre + beslægtede emne-termer (bredere recall)
// Emnegrupper har kun ét match (altid term.subject).

export type TClauseGroup = { cqlIndex: string; cqlValues: string[] }

export type TGroupVariant = "genreOnly" | "genrePlusSubjects"

export type TGenreGroup = {
  id: string
  label: string
  emoji?: string
  genreOnly: TClauseGroup[]
  genrePlusSubjects: TClauseGroup[]
}

export type TSubjectGroup = {
  id: string
  label: string
  emoji?: string
  match: TClauseGroup[]
}

// Små hjælpere: term = enkeltord, phrase = flerord. Termerne er trukket fra
// FBI's faktiske genre-/emneord (samme kilde som tilladt-listen i PoC 2).
const gen = (cqlValues: string[], phrase = false): TClauseGroup => ({
  cqlIndex: phrase ? "phrase.genreandform" : "term.genreandform",
  cqlValues,
})
const sub = (cqlValues: string[], phrase = false): TClauseGroup => ({
  cqlIndex: phrase ? "phrase.subject" : "term.subject",
  cqlValues,
})

// Bare nok genregrupper til at dække de to genre-spørgsmål (ét pr. svar).
export const GENRE_GROUPS: TGenreGroup[] = [
  {
    id: "gys",
    label: "Gys & uhygge",
    emoji: "👻",
    genreOnly: [gen(["gys", "splatter"])],
    genrePlusSubjects: [gen(["gys", "splatter"]), sub(["uhyggelig", "uhygge", "gys"])],
  },
  {
    id: "fantasy",
    label: "Fantasy",
    emoji: "🧙",
    genreOnly: [gen(["fantasy"]), gen(["dark fantasy", "fantastiske fortællinger"], true)],
    genrePlusSubjects: [
      gen(["fantasy"]),
      gen(["dark fantasy", "fantastiske fortællinger"], true),
      sub(["magi", "eventyrlig"]),
    ],
  },
  {
    id: "spaending",
    label: "Spænding",
    emoji: "😱",
    genreOnly: [gen(["spænding"])],
    genrePlusSubjects: [gen(["spænding"]), sub(["spændende", "action"])],
  },
  {
    id: "sjov",
    label: "Sjove bøger",
    emoji: "😂",
    genreOnly: [gen(["humor"]), gen(["sjove bøger"], true)],
    genrePlusSubjects: [gen(["humor"]), gen(["sjove bøger"], true), sub(["sjov"])],
  },
  {
    id: "eventyr",
    label: "Eventyr",
    emoji: "🏰",
    genreOnly: [gen(["eventyr"]), gen(["eventyrlige fortællinger"], true)],
    genrePlusSubjects: [
      gen(["eventyr"]),
      gen(["eventyrlige fortællinger"], true),
      sub(["eventyrlig", "magi"]),
    ],
  },
  {
    id: "scifi",
    label: "Science fiction",
    emoji: "🚀",
    genreOnly: [gen(["dystopier", "fremtidsfortællinger"]), gen(["science fiction"], true)],
    genrePlusSubjects: [
      gen(["dystopier", "fremtidsfortællinger"]),
      gen(["science fiction"], true),
      sub(["ud i fremtiden"], true),
    ],
  },
]

// Bare nok emnegrupper til at dække emne-spørgsmålet.
export const SUBJECT_GROUPS: TSubjectGroup[] = [
  { id: "venskab", label: "Venskab", emoji: "🤝", match: [sub(["venskab", "venner", "veninder"])] },
  {
    id: "kaerlighed",
    label: "Kærlighed",
    emoji: "❤️",
    match: [sub(["kærlighed", "forelskelse", "romantisk"])],
  },
  { id: "magi", label: "Magi", emoji: "✨", match: [sub(["magi"])] },
  { id: "dyr", label: "Dyr", emoji: "🐾", match: [sub(["dyr"])] },
  { id: "familie", label: "Familie", emoji: "👨‍👩‍👧", match: [sub(["familien"])] },
  { id: "sport", label: "Sport", emoji: "⚽", match: [sub(["sport"])] },
  { id: "gaming", label: "Gaming", emoji: "🎮", match: [sub(["gaming"])] },
  { id: "natur", label: "Natur", emoji: "🌿", match: [sub(["natur og miljø"], true)] },
]

export const genreGroupById = (id: string) => GENRE_GROUPS.find(group => group.id === id)
export const subjectGroupById = (id: string) => SUBJECT_GROUPS.find(group => group.id === id)

// Fladgør en gruppes match-led til læsbare CQL-termer (bruges til debug/indsigt).
export const clauseTerms = (clauses: TClauseGroup[]): string[] =>
  clauses.flatMap(clause => clause.cqlValues.map(value => `${clause.cqlIndex}="${value}"`))
