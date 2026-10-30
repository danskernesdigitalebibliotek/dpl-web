// PoC 8: abstrakte, børnevendte spørgsmål som i PoC 6 — men hvert svar peger på
// PRÆCIS ÉN gruppe (genre eller emne), ikke en liste. Ingen score/læsetype.
//
// Flow: to SEPARATE enkelt-valgs genre-spørgsmål (→ præcis to genregrupper),
// ét fler-valgs emne-spørgsmål (→ mange emner), og til sidst alder + lix som
// INTERVALLER (bruges som blødt eller hårdt filter på resultatet).

export type TRange = [number, number]

export type TQuizOption = {
  id: string
  label: string
  emoji?: string
  genreGroupId?: string
  subjectGroupId?: string
  ageRange?: TRange
  lixRange?: TRange
  // Sideantal-interval. Længde kan KUN filtreres client-side (FBI har ingen
  // søgbar facet for boglængde — kun sideantal på manifestationen).
  pageRange?: TRange
}

export type TQuizQuestion = {
  id: string
  title: string
  multi?: boolean
  options: TQuizOption[]
}

export const GENRE_QUESTION_IDS = ["genre-1", "genre-2"] as const

export const QUESTIONS: TQuizQuestion[] = [
  // --- To separate genre-spørgsmål → to genregrupper ---
  {
    id: "genre-1",
    title: "Du får en superkraft. Hvilken vælger du?",
    options: [
      { id: "g1-fantasy", label: "Rejse til verdener, der ikke findes", genreGroupId: "fantasy" },
      { id: "g1-gys", label: "Tale med spøgelser", genreGroupId: "gys" },
      { id: "g1-spaending", label: "Løbe hurtigere end en bil", genreGroupId: "spaending" },
      { id: "g1-sjov", label: "Få hvem som helst til at grine", genreGroupId: "sjov" },
      { id: "g1-eventyr", label: "Åbne døre til eventyr", genreGroupId: "eventyr" },
      { id: "g1-scifi", label: "Rejse ud i rummet", genreGroupId: "scifi" },
    ],
  },
  {
    id: "genre-2",
    title: "Hvilket sted ville du helst være i en historie?",
    options: [
      { id: "g2-fantasy", label: "I en magisk skov", emoji: "🌲", genreGroupId: "fantasy" },
      { id: "g2-gys", label: "Et mørkt, hjemsøgt hus", emoji: "🏚️", genreGroupId: "gys" },
      { id: "g2-spaending", label: "Midt i en vild jagt", emoji: "🏃", genreGroupId: "spaending" },
      { id: "g2-sjov", label: "I en skæv og fjollet verden", emoji: "🤪", genreGroupId: "sjov" },
      { id: "g2-eventyr", label: "Et gammelt slot", emoji: "🏰", genreGroupId: "eventyr" },
      { id: "g2-scifi", label: "En fremmed planet", emoji: "🪐", genreGroupId: "scifi" },
    ],
  },
  // --- Ét emne-spørgsmål (multi) → mange emner ---
  {
    id: "emne",
    title: "Hvad får dit hjerte til at banke hurtigere?",
    multi: true,
    options: [
      { id: "e-venskab", label: "Når venner holder sammen", emoji: "🤝", subjectGroupId: "venskab" },
      { id: "e-kaerlighed", label: "Forelskelse", emoji: "❤️", subjectGroupId: "kaerlighed" },
      { id: "e-magi", label: "Når der er magi i luften", emoji: "✨", subjectGroupId: "magi" },
      { id: "e-dyr", label: "Søde og vilde dyr", emoji: "🐾", subjectGroupId: "dyr" },
      { id: "e-familie", label: "Min familie", emoji: "👨‍👩‍👧", subjectGroupId: "familie" },
      { id: "e-sport", label: "En vigtig kamp eller turnering", emoji: "⚽", subjectGroupId: "sport" },
      { id: "e-gaming", label: "At vinde det store spil", emoji: "🎮", subjectGroupId: "gaming" },
      { id: "e-natur", label: "Naturen og de vilde steder", emoji: "🌿", subjectGroupId: "natur" },
    ],
  },
  // --- Alder som intervaller (multi) ---
  {
    id: "alder",
    title: "Hvad alderstrin vil du læse på?",
    multi: true,
    options: [
      { id: "alder-6", label: "5-6 år", ageRange: [5, 6] },
      { id: "alder-8", label: "7-8 år", ageRange: [7, 8] },
      { id: "alder-10", label: "9-10 år", ageRange: [9, 10] },
      { id: "alder-12", label: "11-12 år", ageRange: [11, 12] },
      { id: "alder-14", label: "13-14 år", ageRange: [13, 14] },
    ],
  },
  // --- Lix som intervaller (multi) ---
  {
    id: "lix",
    title: "Hvor meget kan du lide at læse?",
    multi: true,
    options: [
      { id: "lix-let", label: "Jeg vil have det let", emoji: "😌", lixRange: [0, 15] },
      { id: "lix-mellem", label: "Midt imellem", emoji: "🙂", lixRange: [15, 25] },
      { id: "lix-svaer", label: "Jeg læser gerne svært", emoji: "💪", lixRange: [25, 55] },
    ],
  },
  // --- Længde (sideantal) som intervaller (multi) — kun client-side filter ---
  {
    id: "laengde",
    title: "Hvor tyk en bog vil du helst læse?",
    multi: true,
    options: [
      { id: "laengde-kort", label: "Kort (under 100 sider)", emoji: "📄", pageRange: [0, 100] },
      { id: "laengde-mellem", label: "Mellem (100–250 sider)", emoji: "📗", pageRange: [100, 250] },
      { id: "laengde-lang", label: "Lang (over 250 sider)", emoji: "📚", pageRange: [250, 2000] },
    ],
  },
]
