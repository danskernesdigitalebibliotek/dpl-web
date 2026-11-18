import type { TLadderPart } from "@/lib/book-quiz/ladder"
import type { TBookQuizOption } from "@/lib/book-quiz/questions"

// The answers behind a step, one list per part, e.g. [[Ride på en enhjørning],
// [Et godt grin]]. A part without an answer is an empty list.
export const getStepAnswers = (
  parts: TLadderPart[],
  groupAnswers: Record<TLadderPart, TBookQuizOption[]>
): TBookQuizOption[][] => parts.map(part => groupAnswers[part])

// Extras so the burst in the hero is never sparse.
const HERO_EXTRA_EMOJIS = ["📚", "✨", "⭐"]

// The emojis of the answers behind the results, for the burst in the hero.
export const getHeroEmojis = (groupAnswers: Record<TLadderPart, TBookQuizOption[]>) => [
  ...new Set([
    ...Object.values(groupAnswers).flatMap(options => options.flatMap(({ emoji }) => emoji ?? [])),
    ...HERO_EXTRA_EMOJIS,
  ]),
]
