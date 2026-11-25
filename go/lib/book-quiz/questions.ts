import {
  ANIMALS,
  CLIMATE,
  FANTASY,
  FRIENDS,
  FUNNY,
  GAMING,
  HISTORY,
  HORROR,
  NONFICTION,
  ROMANCE,
  SCIFI,
  SPORT,
  THRILLER,
} from "./groups"
import type { TBookQuizGroup } from "./groups"

// The quiz questions in the order they are asked. A question's id is also its
// key in the result page URL, and an option's id is its value there.
//
// An option maps to at most one thing: a group (genre, mood or subject,
// depending on the question), an age range or a reading level. Options without
// a mapping add no filter. Most of them are the "no answer" of their question
// ("Jeg aner det ikke", "Det er forskelligt", "Ingen af delene", "Alle aldre",
// "Ved ikke"), marked with isNone. "Jeg er en kæmpe læsehest" is an answer, but
// FBI has nothing to filter it on.

export type TBookQuizRange = [number, number]

export type TBookQuizOption = {
  id: string
  label: string
  emoji?: string
  group?: TBookQuizGroup
  ageRange?: TBookQuizRange
  // Only "easy" has a filter. FBI has no marker for hard books.
  easyToRead?: boolean
  // The "no answer" of the question. Where several options can be chosen it
  // stands alone: choosing it clears the other choices, and choosing another
  // option clears it.
  isNone?: boolean
}

export type TBookQuizQuestionId = "genre" | "mood" | "subjects" | "age" | "level"

export type TBookQuizQuestion = {
  id: TBookQuizQuestionId
  title: string
  // Several options can be chosen. Without it a new choice replaces the old
  // one. Any question can be either: nothing else in the quiz depends on which.
  //
  // Mind the number of searches when turning it on for genre, mood or
  // subjects: the result page searches on every combination of those answers,
  // so each answer more doubles the number of combinations.
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
      {
        id: "genre-nonfiction",
        label: "På opdagelse i laboratoriet",
        emoji: "🧪",
        group: NONFICTION,
      },
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
      { id: "genre-any", label: "Jeg aner det ikke", emoji: "🙃", isNone: true },
    ],
  },
  {
    id: "mood",
    title: "Hvad går du efter?",
    options: [
      { id: "mood-funny", label: "Et godt grin", emoji: "😂", group: FUNNY },
      { id: "mood-horror", label: "Gys", emoji: "🧟", group: HORROR },
      { id: "mood-romance", label: "Romantik", emoji: "💘", group: ROMANCE },
      { id: "mood-any", label: "Det er forskelligt", emoji: "🍭", isNone: true },
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
      { id: "subject-other", label: "Ingen af delene", emoji: "🤔", isNone: true },
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
      { id: "age-any", label: "Alle aldre", isNone: true },
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
      { id: "level-any", label: "Ved ikke", emoji: "❓", isNone: true },
    ],
  },
]

export const getQuestion = (id: TBookQuizQuestionId): TBookQuizQuestion => {
  const question = QUESTIONS.find(current => current.id === id)
  if (!question) throw new Error(`Unknown book quiz question: ${id}`)
  return question
}

export const getOptionIds = (id: TBookQuizQuestionId): string[] =>
  getQuestion(id).options.map(option => option.id)
