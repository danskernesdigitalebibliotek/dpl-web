import type { TBookQuizProfile } from "@/lib/book-quiz/profile"
import type { TBookQuizOption } from "@/lib/book-quiz/questions"

type THeroTexts = { leadIn?: string; title: string; text: string }

// The texts in the hero. Without results the hero asks the user to take the
// quiz instead.
export const getHeroTexts = (profile: TBookQuizProfile, hasResults: boolean): THeroTexts => {
  if (!hasResults) {
    return {
      title: "Vi mangler dine svar",
      text: "Tag quizzen for at få forslag til bøger.",
    }
  }
  const bookType = [profile.genre?.label, profile.mood?.label].filter(Boolean).join(" & ")
  return {
    leadIn: "Du kan godt lide",
    title: bookType || "Dine bogforslag",
    text: "Vi har fundet bøger, der passer til dig. Du finder dem herunder.",
  }
}

// Extras so the burst in the hero is never sparse.
const HERO_EXTRA_EMOJIS = ["📚", "✨", "⭐"]

// The emojis of the answers behind the results, for the burst in the hero.
export const getHeroEmojis = (answers: TBookQuizOption[]) => [
  ...new Set([...answers.flatMap(({ emoji }) => emoji ?? []), ...HERO_EXTRA_EMOJIS]),
]

const shuffle = <T>(items: T[]): T[] => {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

// A random pick of `count` works from the pool. Works not shown yet come first,
// so each shuffle shows as many new books as the pool allows.
export const shuffleWorks = <TWork extends { workId: string }>(
  pool: TWork[],
  shown: TWork[],
  count: number
): TWork[] => {
  const shownIds = new Set(shown.map(work => work.workId))
  const unseen = pool.filter(work => !shownIds.has(work.workId))
  const seen = pool.filter(work => shownIds.has(work.workId))
  return shuffle([...shuffle(unseen), ...shuffle(seen)].slice(0, count))
}
