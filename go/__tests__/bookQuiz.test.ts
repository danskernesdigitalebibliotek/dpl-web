import { describe, expect, it } from "vitest"

import { ANIMALS, FANTASY, FUNNY, SPORT } from "@/lib/book-quiz/groups"
import { LADDER, getLadderSteps } from "@/lib/book-quiz/ladder"
import { getBookQuizProfile } from "@/lib/book-quiz/profile"
import {
  BOOKS_PER_STEP,
  type TRankableWork,
  getAgeSpill,
  getWorkAgeSpan,
  rankStepWorks,
} from "@/lib/book-quiz/rank"

const work = (workId: string, ages: [number, number] | null): TRankableWork => ({
  workId,
  manifestations: {
    all: [{ audience: ages ? { ages: [{ begin: ages[0], end: ages[1] }] } : null }],
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
    expect(getLadderSteps(profile).every(step => step.cql === null)).toBe(true)
  })
})

describe("getLadderSteps", () => {
  it("always returns every step in ladder order", () => {
    const steps = getLadderSteps(getBookQuizProfile({ genre: "genre-fantasy" }))
    expect(steps.map(step => step.id)).toEqual(LADDER.map(parts => parts.join("+")))
  })

  it("only searches steps where every part is answered", () => {
    const steps = getLadderSteps(getBookQuizProfile({ genre: "genre-fantasy", subjects: ["subject-animals"] }))
    const searched = steps.filter(step => step.cql !== null).map(step => step.id)
    expect(searched).toEqual(["genre+subjects", "genre", "subjects"])
  })

  it("ANDs the parts and applies age and easy-to-read to every step", () => {
    const steps = getLadderSteps(
      getBookQuizProfile({
        genre: "genre-fantasy",
        mood: "mood-funny",
        age: "age-9-10",
        level: "level-easy",
      })
    )
    expect(steps.find(step => step.id === "genre+mood")?.cql).toBe(
      '(phrase.genreandform="fantasy") AND ' +
        '(phrase.genreandform="sjove bøger" OR phrase.subject="sjov") AND ' +
        'ages within "9 10" AND phrase.generalaudience="let at læse"'
    )
    expect(steps.find(step => step.id === "mood")?.cql).toContain('ages within "9 10"')
  })

  it("ORs the terms of several subjects", () => {
    const steps = getLadderSteps(getBookQuizProfile({ subjects: ["subject-animals", "subject-gaming"] }))
    const cql = steps.find(step => step.id === "subjects")?.cql
    expect(cql).toMatch(/^\(phrase\.subject="dyr" OR .* OR phrase\.subject="gaming" OR .*\)$/)
  })

})

describe("rank", () => {
  it("reads the age span from any manifestation", () => {
    expect(getWorkAgeSpan(work("a", [9, 12]))).toEqual([9, 12])
    expect(getWorkAgeSpan(work("a", null))).toBeNull()
  })

  it("counts the years outside the chosen range", () => {
    expect(getAgeSpill(work("a", [9, 10]), [9, 10])).toBe(0)
    expect(getAgeSpill(work("a", [8, 14]), [9, 10])).toBe(5)
    expect(getAgeSpill(work("a", null), [9, 10])).toBeNull()
    expect(getAgeSpill(work("a", [3, 18]), undefined)).toBe(0)
  })

  it("drops too wide spans, sorts by spill, keeps FBI order on ties and caps the list", () => {
    const ranked = rankStepWorks(
      [
        work("wide", [6, 14]),
        work("unknown", null),
        work("near", [9, 11]),
        work("exact-1", [9, 10]),
        work("exact-2", [9, 10]),
      ],
      [9, 10]
    )
    expect(ranked).toHaveLength(BOOKS_PER_STEP)
    expect(ranked.map(entry => entry.workId)).toEqual(["exact-1", "exact-2", "near"])
  })

  it("puts works without age data last instead of dropping them", () => {
    const ranked = rankStepWorks([work("unknown", null), work("exact", [9, 10])], [9, 10])
    expect(ranked.map(entry => entry.workId)).toEqual(["exact", "unknown"])
  })
})
