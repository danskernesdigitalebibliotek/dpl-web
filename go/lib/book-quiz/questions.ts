import {
  OTHER,
  ANIMALS,
  NONFICTION,
  FANTASY,
  GAMING,
  HORROR,
  HISTORY,
  CLIMATE,
  NOVELS,
  ROMANCE,
  SCIFI,
  FUNNY,
  THRILLER,
  SPORT,
  type TBookQuizGroup,
  FRIENDS,
} from "./groups"

// The quiz questions in the order they are asked. A question's id is also its
// key in the result page URL, and an option's id is its value there.
//
// An option maps to at most one thing: a group (genre, mood or subject,
// depending on the question), an age range or a reading level. Options without
// a mapping ("Det er forskelligt", "Ved ikke", "Jeg er en kæmpe læsehest") add
// no filter.

export type TBookQuizRange = [number, number]

export type TBookQuizOption = {
  id: string
  label: string
  emoji?: string
  group?: TBookQuizGroup
  ageRange?: TBookQuizRange
  // Only "easy" has a filter. FBI has no marker for hard books.
  easyToRead?: boolean
}

export type TBookQuizQuestionId = "genre" | "mood" | "subjects" | "age" | "level"

export type TBookQuizQuestion = {
  id: TBookQuizQuestionId
  title: string
  multi?: boolean
  options: TBookQuizOption[]
}

export const QUESTIONS: TBookQuizQuestion[] = [
  {
    id: "genre",
    title: "Hvilken rejse vil du helst ud på?",
    options: [
      { id: "genre-thriller", label: "Ud på en vild mission", emoji: "💣", group: THRILLER },
      { id: "genre-fantasy", label: "Ride på en enhjørning", emoji: "🦄", group: FANTASY },
      { id: "genre-friends", label: "På tur med vennerne", emoji: "👨‍👩‍👧‍👦", group: FRIENDS },
      { id: "genre-nonfiction", label: "På opdagelse i laboratoriet", emoji: "🧪", group: NONFICTION },
      {
        id: "genre-scifi",
        label: "På rejse til en fremmed planet",
        emoji: "🪐",
        group: SCIFI,
      },
      {
        id: "genre-history",
        label: "På en tidsrejse tilbage i tiden",
        emoji: "🕰️",
        group: HISTORY,
      },
      { id: "genre-novels", label: "Jeg aner det ikke", emoji: "🙃", group: NOVELS },
    ],
  },
  {
    id: "mood",
    title: "Hvad går du efter?",
    options: [
      { id: "mood-funny", label: "Et godt grin", emoji: "😂", group: FUNNY },
      { id: "mood-horror", label: "Gys", emoji: "🧟", group: HORROR },
      { id: "mood-romance", label: "Romantik", emoji: "💘", group: ROMANCE },
      { id: "mood-any", label: "Det er forskelligt", emoji: "🍬🍭" },
    ],
  },
  {
    id: "subjects",
    title: "Hvad synes du er mest spændende?",
    multi: true,
    options: [
      { id: "subject-animals", label: "Dyr", emoji: "🐰", group: ANIMALS },
      { id: "subject-gaming", label: "Gaming", emoji: "🎮", group: GAMING },
      { id: "subject-sport", label: "Sport", emoji: "⚽", group: SPORT },
      { id: "subject-climate", label: "Klima", emoji: "🌿", group: CLIMATE },
      { id: "subject-other", label: "Ingen af delene", emoji: "🤔", group: OTHER },
    ],
  },
  {
    id: "age",
    title: "Hvilket alderstrin vil du læse på?",
    options: [
      { id: "age-6-8", label: "6-8 år", ageRange: [6, 8] },
      { id: "age-9-10", label: "9-10 år", ageRange: [9, 10] },
      { id: "age-11-12", label: "11-12 år", ageRange: [11, 12] },
      { id: "age-teen", label: "Teenagere", ageRange: [13, 18] },
    ],
  },
  {
    id: "level",
    title: "Hvad passer bedst på dig?",
    options: [
      { id: "level-advanced", label: "Jeg er en kæmpe læsehest", emoji: "🏇" },
      {
        id: "level-easy",
        label: "Jeg er mest til lette bøger",
        emoji: "📘",
        easyToRead: true,
      },
      { id: "level-any", label: "Ved ikke", emoji: "❓" },
    ],
  },
]

export const getQuestion = (id: TBookQuizQuestionId): TBookQuizQuestion => {
  const question = QUESTIONS.find(current => current.id === id)
  if (!question) throw new Error(`Unknown book quiz question: ${id}`)
  return question
}
