import { filterFalsyValuesFromArray } from "@/lib/helpers/helper.arrays"

import type { TBookQuizClause } from "./groups"
import type { TBookQuizProfile } from "./profile"
import type { TBookQuizRange } from "./questions"

export type TLadderPart = "genre" | "mood" | "subjects"

// The search ladder, from most to least specific. Each step is one section on
// the result page, so trimming the ladder after user tests only touches this
// list.
export const LADDER: TLadderPart[][] = [
  ["genre", "mood", "subjects"],
  ["genre", "mood"],
  ["genre", "subjects"],
  ["genre"],
  ["mood", "subjects"],
  ["mood"],
  ["subjects"],
]

export type TLadderStep = {
  id: string
  parts: TLadderPart[]
  // Null when a part is missing from the profile. The step is still shown,
  // but with the "no books" message instead of a search.
  cql: string | null
}

const EASY_TO_READ_CQL = 'phrase.generalaudience="let at læse"'

const clauseCql = (clauses: TBookQuizClause[]): string | null => {
  const terms = clauses.flatMap(clause =>
    clause.cqlValues.map(value => `${clause.cqlIndex}="${value}"`)
  )
  return terms.length > 0 ? `(${terms.join(" OR ")})` : null
}

const ageCql = ([low, high]: TBookQuizRange) => `ages within "${low} ${high}"`

// Age and "easy to read" apply to every step. Only genre, mood and subjects are
// loosened down the ladder.
export const getLadderSteps = (profile: TBookQuizProfile): TLadderStep[] => {
  const partCql: Record<TLadderPart, string | null> = {
    genre: clauseCql(profile.genre?.match ?? []),
    mood: clauseCql(profile.mood?.match ?? []),
    // Several subjects widen the search: a work matches any of their terms.
    subjects: clauseCql(profile.subjects.flatMap(group => group.match)),
  }
  const always = filterFalsyValuesFromArray([
    profile.ageRange ? ageCql(profile.ageRange) : null,
    profile.easyToRead ? EASY_TO_READ_CQL : null,
  ])

  return LADDER.map(parts => {
    const cqls = parts.map(part => partCql[part])
    const complete = cqls.every(Boolean)
    return {
      id: parts.join("+"),
      parts,
      cql: complete ? [...cqls, ...always].join(" AND ") : null,
    }
  })
}
