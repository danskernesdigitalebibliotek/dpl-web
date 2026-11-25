import { describe, expect, it } from "vitest"

import { ANIMALS, FANTASY, FUNNY, SPORT } from "@/lib/book-quiz/groups"
import { MAX_SECTIONS, getLadderSteps, getShownSteps } from "@/lib/book-quiz/ladder"
import { getBookQuizProfile } from "@/lib/book-quiz/profile"
import {
  BOOKS_PER_STEP,
  type TRankableWork,
  getAgeSpill,
  getStepWorkPool,
  getWorkAgeSpans,
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
    const profile = getBookQuizProfile({
      mood: "mood-any",
      age: "age-any",
      level: "level-advanced",
    })
    expect(profile.mood).toBeUndefined()
    expect(profile.ageRange).toBeUndefined()
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
    expect(getLadderSteps({ genre: "genre-any", mood: "mood-any", age: "age-9-10" })).toEqual([])
  })

  it("ANDs the answers and applies the age to every step", () => {
    const steps = getLadderSteps({ genre: "genre-fantasy", mood: "mood-funny", age: "age-9-10" })
    // The ages may reach two years outside the chosen 9-10.
    expect(steps.find(step => step.id === "genre-fantasy+mood-funny")?.cql).toBe(
      '(phrase.genreandform="fantasy") AND ' +
        '(phrase.genreandform="sjove bøger" OR phrase.subject="sjov") AND ' +
        '(ages within "9 10" NOT ages>=13 NOT ages<=6)'
    )
    expect(steps.find(step => step.id === "mood-funny")?.cql).toContain('ages within "9 10"')
  })

  it("searches on easy-to-read instead of the age when both are chosen", () => {
    const steps = getLadderSteps({ genre: "genre-fantasy", age: "age-9-10", level: "level-easy" })
    expect(steps.map(step => step.cql)).toEqual([
      '(phrase.genreandform="fantasy") AND phrase.generalaudience="let at læse"',
    ])
  })
})

describe("getShownSteps", () => {
  // Five answers give 31 steps.
  const steps = getLadderSteps({
    genre: "genre-fantasy",
    mood: "mood-funny",
    subjects: ["subject-animals", "subject-gaming", "subject-sport"],
  })
  const ids = (shown: typeof steps) => shown.map(step => step.id)

  it("shows the first steps, up to the most the page has room for, before any search", () => {
    expect(getShownSteps(steps, () => undefined)).toEqual(steps.slice(0, MAX_SECTIONS))
  })

  it("lets the next step in for each step with too few books", () => {
    // The first step found nothing and the fourth less than a row.
    const counts = new Map([
      [steps[0].id, 0],
      [steps[3].id, BOOKS_PER_STEP - 1],
    ])
    const shown = getShownSteps(steps, step => counts.get(step.id))
    expect(ids(shown)).toEqual([1, 2, 4, 5, 6, 7, 8].map(index => steps[index].id))
  })

  it("stops at the first steps with enough books", () => {
    // Only steps with one or two answers have enough books.
    const shown = getShownSteps(steps, step => (step.answers.length <= 2 ? 20 : 1))
    expect(shown).toHaveLength(MAX_SECTIONS)
    expect(shown.every(step => step.answers.length === 2)).toBe(true)
  })

  it("fills up with the steps with few books when there are not enough others", () => {
    const [fantasyFunny, fantasy, funny] = getLadderSteps({
      genre: "genre-fantasy",
      mood: "mood-funny",
    })
    const counts = new Map([
      [fantasyFunny.id, 2],
      [fantasy.id, 20],
      [funny.id, 0],
    ])
    const shown = getShownSteps([fantasyFunny, fantasy, funny], step => counts.get(step.id))
    // In ladder order, without the step that found nothing.
    expect(ids(shown)).toEqual([fantasyFunny.id, fantasy.id])
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

  it("sorts by spill, keeps FBI order on ties and drops no works", () => {
    const pool = getStepWorkPool(
      [
        work("wide", [6, 14]),
        work("unknown", null),
        work("near", [9, 11]),
        work("exact-1", [9, 10]),
        work("exact-2", [9, 10]),
      ],
      [9, 10]
    )
    // Works without age data go last.
    expect(pool.map(entry => entry.workId)).toEqual([
      "exact-1",
      "exact-2",
      "near",
      "wide",
      "unknown",
    ])
  })

  it("keeps FBI order when no age is chosen", () => {
    const pool = getStepWorkPool([work("unknown", null), work("wide", [3, 18])], undefined)
    expect(pool.map(entry => entry.workId)).toEqual(["unknown", "wide"])
  })
})
