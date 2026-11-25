import type { TBookQuizOption } from "@/lib/book-quiz/questions"

type THeroTexts = { leadIn?: string; title?: string; text: string }

// The texts in the hero. With results, the lead-in is followed by the user's
// answers as the heading. Without, the hero asks the user to take the quiz.
export const getHeroTexts = (hasResults: boolean): THeroTexts =>
  hasResults
    ? { leadIn: "Vi tror, du kan lide", text: "Vi har fundet de her bøger til dig" }
    : { title: "Vi mangler dine svar", text: "Tag quizzen for at få forslag til bøger." }

// Extras so the burst in the hero is never sparse.
const HERO_EXTRA_EMOJIS = ["📚", "✨", "⭐"]

// The emojis of the answers behind the results, for the burst in the hero.
export const getHeroEmojis = (answers: TBookQuizOption[]) => [
  ...new Set([...answers.flatMap(({ emoji }) => emoji ?? []), ...HERO_EXTRA_EMOJIS]),
]

// The items in lists of `size`, the last one with what is left.
export const getBatches = <T>(items: T[], size: number): T[][] =>
  Array.from({ length: Math.ceil(items.length / size) }, (_, index) =>
    items.slice(index * size, (index + 1) * size)
  )
