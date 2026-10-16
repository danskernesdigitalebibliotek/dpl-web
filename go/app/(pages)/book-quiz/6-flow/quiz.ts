// PoC 6: et mere "rigtigt" quizflow med ABSTRAKTE spørgsmål. Hvert svar peger
// (indirekte) på en genre eller et emne fra tilladt-listen (PoC 2) — og bærer
// derved score til læse-typerne (PoC 5) — plus evt. bløde signaler (lix/alder).
// Labels SKAL matche allowedList.
//
// Struktur: de første 2 trin peger på GENRE, de næste trin peger på EMNER (som
// korreleres/filtreres ud fra genrerne). Et spørgsmål peger kun på én dimension
// ad gangen — genre og emne blandes aldrig — men et enkelt svar må gerne pege
// på FLERE genrer/emner (fx Dyr + Natur og miljø).
//
// Spørgsmålene har med vilje FLERE svar, end der vises: dashboardet viser et
// subset (de valgbare først), så der altid er mindst 3 valgbare — også efter
// emne-korrelationen har deaktiveret nogle.

export type TQuizOption = {
  id: string
  label: string
  emoji?: string
  genres?: string[]
  subjects?: string[]
  materialTypes?: string[]
  lix?: string
  age?: string
  note?: string
}

export type TQuizQuestion = {
  id: string
  title: string
  multi?: boolean
  options: TQuizOption[]
}

export const QUESTIONS: TQuizQuestion[] = [
  // --- Trin 1-2: GENRE via abstrakte spørgsmål ---
  {
    id: "superkraft",
    title: "Du får en superkraft. Hvilken vælger du?",
    options: [
      { id: "sk-rejse", label: "Rejse til verdener, der ikke findes", genres: ["Fantasy"] },
      { id: "sk-lyv", label: "Se, når nogen lyver", genres: ["Krimi"] },
      { id: "sk-hurtig", label: "Løbe hurtigere end en bil", genres: ["Spænding"] },
      { id: "sk-grine", label: "Få hvem som helst til at grine", genres: ["Sjove bøger"] },
      { id: "sk-spoegelser", label: "Tale med spøgelser", genres: ["Gys"] },
      { id: "sk-rum", label: "Rejse ud i rummet", genres: ["Science fiction"] },
      { id: "sk-eventyr", label: "Åbne døre til eventyr", genres: ["Eventyr"] },
      { id: "sk-tegne", label: "Tegne ting, der bliver levende", genres: ["Tegneserier"] },
    ],
  },
  {
    id: "sted",
    title: "Hvilket sted ville du helst være i en historie?",
    options: [
      { id: "st-slot", label: "Et gammelt slot", emoji: "🏰", genres: ["Eventyr"] },
      { id: "st-planet", label: "En fremmed planet", emoji: "🪐", genres: ["Science fiction"] },
      { id: "st-hus", label: "Et mørkt, hjemsøgt hus", emoji: "🏚️", genres: ["Gys"] },
      { id: "st-jagt", label: "Midt i en vild jagt", emoji: "🏃", genres: ["Spænding"] },
      { id: "st-gerning", label: "På et mystisk gerningssted", emoji: "🔍", genres: ["Krimi"] },
      { id: "st-skov", label: "I en magisk skov", emoji: "🌲", genres: ["Fantasy"] },
      {
        id: "st-skaev",
        label: "I en skæv og fjollet verden",
        emoji: "🤪",
        genres: ["Sjove bøger"],
      },
      { id: "st-tegne", label: "Inde i en tegneserie", emoji: "💥", genres: ["Tegneserier"] },
    ],
  },
  // --- Trin 3+: EMNER via abstrakte spørgsmål (filtreres efter genrerne) ---
  {
    id: "hjerte",
    title: "Hvad får dit hjerte til at banke hurtigere?",
    multi: true,
    options: [
      { id: "hj-venner", label: "Når venner holder sammen", emoji: "🤝", subjects: ["Venskab"] },
      { id: "hj-magi", label: "Når der er magi i luften", emoji: "✨", subjects: ["Magi"] },
      {
        id: "hj-dyr",
        label: "Søde og vilde dyr",
        emoji: "🐾",
        subjects: ["Dyr", "Natur og miljø"],
      },
      { id: "hj-sport", label: "En vigtig kamp eller turnering", emoji: "⚽", subjects: ["Sport"] },
      { id: "hj-gaming", label: "At vinde det store spil", emoji: "🎮", subjects: ["Gaming"] },
      {
        id: "hj-historie",
        label: "Hemmeligheder fra fortiden",
        emoji: "📜",
        subjects: ["Historie"],
      },
      {
        id: "hj-natur",
        label: "Naturen og de vilde steder",
        emoji: "🌿",
        subjects: ["Natur og miljø"],
      },
      {
        id: "hj-uhygge",
        label: "Noget, der giver kuldegysninger",
        emoji: "🕷️",
        subjects: ["Uhygge"],
      },
    ],
  },
  {
    id: "tanker",
    title: "Hvad tænker du mest på?",
    options: [
      { id: "ta-foelelser", label: "Mine følelser", emoji: "😢", subjects: ["Følelser"] },
      {
        id: "ta-kaerlighed",
        label: "Forelskelse",
        emoji: "❤️",
        subjects: ["Kærlighed", "Følelser"],
      },
      { id: "ta-familie", label: "Min familie", emoji: "👨‍👩‍👧", subjects: ["Familie"] },
      { id: "ta-skolen", label: "Det, der sker i skolen", emoji: "🏫", subjects: ["Skolen"] },
      { id: "ta-venner", label: "Mine bedste venner", emoji: "🤝", subjects: ["Venskab"] },
      { id: "ta-magi", label: "Drømme og fantasi", emoji: "✨", subjects: ["Magi"] },
      { id: "ta-dyr", label: "Mit kæledyr", emoji: "🐾", subjects: ["Dyr"] },
      { id: "ta-historie", label: "Dengang i gamle dage", emoji: "📜", subjects: ["Historie"] },
    ],
  },
  // --- Sidste trin: læsetype (blødt — hverken genre eller emne) ---
  {
    id: "laesetype",
    title: "Hvad passer bedst på dig som læser?",
    options: [
      { id: "laesehest", label: "En rigtig læsehest", emoji: "😌", lix: "30" },
      { id: "okay", label: "Jeg læser okay", emoji: "🙂", lix: "20" },
      {
        id: "ikke",
        label: "Jeg kan ikke lide at læse",
        emoji: "😣",
        lix: "10",
        materialTypes: ["Lydbog"],
      },
      { id: "billeder", label: "Der skal være mange billeder", emoji: "🖼️", age: "fra 6 år" },
    ],
  },
]
