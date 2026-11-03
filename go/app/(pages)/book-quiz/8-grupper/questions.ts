// PoC 8: abstrakte, børnevendte spørgsmål som i PoC 6 — men hvert svar peger på
// PRÆCIS ÉN gruppe (genre eller emne), ikke en liste. Ingen score/læsetype.
//
// Flow: to SEPARATE enkelt-valgs genre-spørgsmål (overordnet genre + stemning →
// højst to genregrupper = to lister), ét fler-valgs emne-spørgsmål (→ mange
// emner), alder som INTERVALLER og læseniveau. Lix vælges i resultatet (blødt/hårdt), ikke
// i quizzen.
// "Det er forskelligt"/"Ved ikke"-svar har intet mapping = intet filter.

export type TRange = [number, number]

// Læseniveau: "easy" = generalaudience "let at læse" (CQL). Der findes intet
// filter for "svære" bøger — svaret har kun en note.
export type TReadingLevel = "easy"

export type TQuizOption = {
  id: string
  label: string
  emoji?: string
  genreGroupId?: string
  subjectGroupId?: string
  ageRange?: TRange
  readingLevel?: TReadingLevel
  // Vises i stedet for mapping, når svaret ikke kan oversættes til et filter.
  note?: string
}

export type TQuizQuestion = {
  id: string
  title: string
  multi?: boolean
  options: TQuizOption[]
}

export const GENRE_QUESTION_IDS = ["genre", "stemning"] as const

export const QUESTIONS: TQuizQuestion[] = [
  // --- Overordnet genre → genregruppe (liste 1) ---
  {
    id: "genre",
    title: "Hvilken rejse vil du helst ud på?",
    options: [
      { id: "g-spaending", label: "Ud på en vild mission", emoji: "💣", genreGroupId: "spaending" },
      { id: "g-fantasy", label: "Ride på en enhjørning", emoji: "🦄", genreGroupId: "fantasy" },
      { id: "g-venner", label: "På tur med vennerne", emoji: "👨‍👩‍👧‍👦", genreGroupId: "venner" },
      { id: "g-fakta", label: "På opdagelse i laboratoriet", emoji: "🧪", genreGroupId: "fakta" },
      {
        id: "g-scifi",
        label: "På rejse til en fremmed planet",
        emoji: "🪐",
        genreGroupId: "scifi",
      },
      {
        id: "g-historie",
        label: "På en tidsrejse tilbage i tiden",
        emoji: "🕰️",
        genreGroupId: "historie",
      },
      { id: "g-romaner", label: "Jeg aner det ikke", emoji: "🙃", genreGroupId: "romaner" },
    ],
  },
  // --- Stemning → genregruppe (liste 2) ---
  {
    id: "stemning",
    title: "Hvad går du efter?",
    options: [
      { id: "s-sjov", label: "Et godt grin", emoji: "😂", genreGroupId: "sjov" },
      { id: "s-gys", label: "Gys", emoji: "🧟", genreGroupId: "gys" },
      { id: "s-romantik", label: "Romantik", emoji: "💘", genreGroupId: "romantik" },
      { id: "s-alle", label: "Det er forskelligt", emoji: "🍬🍭" },
    ],
  },
  // --- Alder som intervaller. 10 år er en vigtig skillelinje (børneinddragelse). ---
  // Idé til senere: udeluk bøger der spænder over mange alderstrin (a la NOT ages >= 9).
  {
    id: "alder",
    title: "Hvilket alderstrin vil du læse på?",
    options: [
      { id: "alder-6-8", label: "6-8 år", ageRange: [6, 8] },
      { id: "alder-9-10", label: "9-10 år", ageRange: [9, 10] },
      { id: "alder-11-12", label: "11-12 år", ageRange: [11, 12] },
      { id: "alder-teen", label: "Teenagere", ageRange: [13, 18] },
    ],
  },
  // --- Ét emne-spørgsmål (multi) → mange emner ---
  {
    id: "emne",
    title: "Hvad synes du er mest spændende?",
    multi: true,
    options: [
      { id: "e-dyr", label: "Dyr", emoji: "🐰", subjectGroupId: "dyr" },
      { id: "e-gaming", label: "Gaming", emoji: "🎮", subjectGroupId: "gaming" },
      { id: "e-sport", label: "Sport", emoji: "⚽", subjectGroupId: "sport" },
      { id: "e-klima", label: "Klima", emoji: "🌿", subjectGroupId: "klima" },
      { id: "e-andet", label: "Ingen af delene", emoji: "🤔", subjectGroupId: "andet" },
    ],
  },
  // --- Læseniveau ---
  {
    id: "laeseniveau",
    title: "Hvad passer bedst på dig?",
    options: [
      {
        id: "niveau-svaer",
        label: "Jeg er en kæmpe læsehest",
        emoji: "🏇",
        note: "kan ikke finde et filter på dette",
      },
      { id: "niveau-let", label: "Jeg er mest til lette bøger", emoji: "📘", readingLevel: "easy" },
      { id: "niveau-alle", label: "Ved ikke", emoji: "❓" },
    ],
  },
]
