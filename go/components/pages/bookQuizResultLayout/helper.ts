import type { TBookQuizOption } from "@/lib/book-quiz/questions"

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
