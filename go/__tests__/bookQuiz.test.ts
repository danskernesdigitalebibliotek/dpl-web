import { describe, expect, it } from "vitest"

import { ANIMALS, FANTASY, FUNNY, SPORT } from "@/lib/book-quiz/groups"
import { getLadderSteps } from "@/lib/book-quiz/ladder"
import { getBookQuizProfile } from "@/lib/book-quiz/profile"
import {
  BOOKS_PER_STEP,
  type TRankableWork,
  getAgeSpill,
  getStepWorkPool,
  getWorkAgeSpans,
  rankStepWorks,
} from "@/lib/book-quiz/rank"

// One edition per age span. Null is an edition without age data.
const work = (workId: string, ...editions: ([number, number] | null)[]): TRankableWork => ({
  workId,
  manifestations: {
    all: editions.map(ages => ({
      audience: ages ? { ages: [{ begin: ages[0], end: ages[1] }] } : null,
    })),
  },
})

describe("getBookQuizProfile", () => {
  it("maps answer ids to groups, age range and reading level", () => {
    const profile = getBookQuizProfile({
      genre: "genre-fantasy",
      mood: "mood-funny",
      subjects: ["subject-animals", "subject-sport"],
      age: "age-9-10",
      level: "level-easy",
    })
    expect(profile.genre).toBe(FANTASY)
    expect(profile.mood).toBe(FUNNY)
    expect(profile.subjects).toEqual([ANIMALS, SPORT])
    expect(profile.ageRange).toEqual([9, 10])
    expect(profile.easyToRead).toBe(true)
  })

  it("leaves out answers without a mapping", () => {
    const profile = getBookQuizProfile({ mood: "mood-any", level: "level-advanced" })
    expect(profile.mood).toBeUndefined()
    expect(profile.easyToRead).toBe(false)
  })
})

describe("getLadderSteps", () => {
  it("returns every combination of the answers, with most answers first", () => {
    const steps = getLadderSteps({
      genre: "genre-fantasy",
      mood: "mood-funny",
      subjects: ["subject-animals"],
    })
    expect(steps.map(step => step.id)).toEqual([
      "genre-fantasy+mood-funny+subject-animals",
      "genre-fantasy+mood-funny",
      "genre-fantasy+subject-animals",
      "mood-funny+subject-animals",
      "genre-fantasy",
      "mood-funny",
      "subject-animals",
    ])
  })

  it("counts every subject as its own answer", () => {
    const steps = getLadderSteps({
      genre: "genre-fantasy",
      subjects: ["subject-animals", "subject-gaming"],
    })
    expect(steps.map(step => step.id)).toEqual([
      "genre-fantasy+subject-animals+subject-gaming",
      "genre-fantasy+subject-animals",
      "genre-fantasy+subject-gaming",
      "subject-animals+subject-gaming",
      "genre-fantasy",
      "subject-animals",
      "subject-gaming",
    ])
    expect(steps[3].cql).toMatch(
      /^\(phrase\.subject="dyr" OR .*\) AND \(phrase\.subject="gaming" OR .*\)$/
    )
    expect(steps[3].answers.map(option => option.label)).toEqual(["Dyr", "Gaming"])
  })

  it("leaves out skipped questions and answers without a group", () => {
    const steps = getLadderSteps({
      genre: "genre-fantasy",
      mood: "mood-any",
      subjects: ["subject-other"],
    })
    expect(steps.map(step => step.id)).toEqual(["genre-fantasy"])
    expect(getLadderSteps({ mood: "mood-any", level: "level-advanced" })).toEqual([])
  })

  it("ANDs the answers and applies age and easy-to-read to every step", () => {
    const steps = getLadderSteps({
      genre: "genre-fantasy",
      mood: "mood-funny",
      age: "age-9-10",
      level: "level-easy",
    })
    // The ages may reach two years outside the chosen 9-10.
    expect(steps.find(step => step.id === "genre-fantasy+mood-funny")?.cql).toBe(
      '(phrase.genreandform="fantasy") AND ' +
        '(phrase.genreandform="sjove bøger" OR phrase.subject="sjov") AND ' +
        '(ages within "9 10" NOT ages>=13 NOT ages<=6) AND ' +
        'phrase.generalaudience="let at læse"'
    )
    expect(steps.find(step => step.id === "mood-funny")?.cql).toContain('ages within "9 10"')
  })
})

describe("rank", () => {
  it("reads the age spans of every edition", () => {
    expect(getWorkAgeSpans(work("a", null, [9, 12], [10, 14]))).toEqual([
      [9, 12],
      [10, 14],
    ])
    expect(getWorkAgeSpans(work("a", null))).toEqual([])
  })

  it("counts the years the best fitting edition is outside the chosen range", () => {
    expect(getAgeSpill(work("a", [9, 10]), [9, 10])).toBe(0)
    expect(getAgeSpill(work("a", [8, 14]), [9, 10])).toBe(5)
    expect(getAgeSpill(work("a", [8, 14], [9, 11]), [9, 10])).toBe(1)
    expect(getAgeSpill(work("a", null), [9, 10])).toBeNull()
  })

  it("sorts by spill, keeps FBI order on ties and caps the list", () => {
    const ranked = rankStepWorks(
      [
        work("wide", [6, 14]),
        work("unknown", null),
        work("near", [9, 11]),
        work("exact-1", [9, 10]),
        work("exact-2", [9, 10]),
        work("exact-3", [9, 10]),
      ],
      [9, 10]
    )
    expect(ranked).toHaveLength(BOOKS_PER_STEP)
    expect(ranked.map(entry => entry.workId)).toEqual(["exact-1", "exact-2", "exact-3", "near"])
  })

  it("keeps works with a wide age span, after the better fitting ones", () => {
    const pool = getStepWorkPool([work("wide", [6, 14]), work("exact", [9, 10])], [9, 10])
    expect(pool.map(entry => entry.workId)).toEqual(["exact", "wide"])
  })

  it("keeps FBI order when no age is chosen", () => {
    const ranked = rankStepWorks([work("unknown", null), work("wide", [3, 18])], undefined)
    expect(ranked.map(entry => entry.workId)).toEqual(["unknown", "wide"])
  })

  it("puts works without age data last instead of dropping them", () => {
    const ranked = rankStepWorks([work("unknown", null), work("exact", [9, 10])], [9, 10])
    expect(ranked.map(entry => entry.workId)).toEqual(["exact", "unknown"])
  })
})
