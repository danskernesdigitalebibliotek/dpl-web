import { filterFalsyValuesFromArray } from "@/lib/helpers/helper.arrays"

import type { TBookQuizClause } from "./groups"
import {
  type TBookQuizAnswers,
  type TBookQuizGroupOption,
  getBookQuizProfile,
  getGroupAnswers,
} from "./profile"
import type { TBookQuizRange } from "./questions"

// One search, and one section on the result page.
export type TLadderStep = {
  id: string
  // The answers the step searches on. A work has to match all of them.
  answers: TBookQuizGroupOption[]
  cql: string
}

// Books fetched per step, so the result page has more to show than the first
// few.
const FETCH_PER_STEP = 20

// Query variables for one step. Shared by the result page sections and the
// quiz modal, which fills the cache before navigating, so the keys match.
export const getStepQueryVariables = (cql: string) => ({ cql, limit: FETCH_PER_STEP })

const EASY_TO_READ_CQL = 'phrase.generalaudience="let at læse"'

const clauseCql = (clauses: TBookQuizClause[]) =>
  `(${clauses
    .flatMap(clause => clause.cqlValues.map(value => `${clause.cqlIndex}="${value}"`))
    .join(" OR ")})`

// How many years an edition's age span may reach outside the chosen ages.
const AGE_TOLERANCE = 2

// Matches when one edition of the work is for the chosen ages and reaches at
// most AGE_TOLERANCE years outside them. `within` alone only asks for overlap,
// so most of the books for 9-10 would be for 10-14. FBI matches per edition, and
// the ages index holds every year of an edition's span.
const ageCql = ([low, high]: TBookQuizRange) =>
  `(ages within "${low} ${high}" NOT ages>=${high + AGE_TOLERANCE + 1} NOT ages<=${low - AGE_TOLERANCE - 1})`

// Every way to pick `size` of the items, in the order of the items.
const getCombinations = <T>(items: T[], size: number): T[][] =>
  size === 0
    ? [[]]
    : items.flatMap((item, index) =>
        getCombinations(items.slice(index + 1), size - 1).map(rest => [item, ...rest])
      )

// The search ladder, from most to least specific: first all the answers
// together, then every combination with one answer less, down to one answer at
// a time. All answers weigh the same, so the steps are only sorted by how many
// answers they hold. Skipped questions and answers without a group ("Det er
// forskelligt", "Ingen af delene") are not part of the ladder.
//
// Age or "easy to read" applies to every step. With "easy to read" the age is
// not searched on, as the two together leave too few books. The books are
// still sorted by the age, see rank.ts.
export const getLadderSteps = (answers: TBookQuizAnswers): TLadderStep[] => {
  const { ageRange, easyToRead } = getBookQuizProfile(answers)
  const always = filterFalsyValuesFromArray([
    ageRange && !easyToRead ? ageCql(ageRange) : null,
    easyToRead ? EASY_TO_READ_CQL : null,
  ])
  const groupAnswers = getGroupAnswers(answers)
  const sizes = groupAnswers.map((_, index) => groupAnswers.length - index)

  return sizes.flatMap(size =>
    getCombinations(groupAnswers, size).map(stepAnswers => ({
      id: stepAnswers.map(option => option.id).join("+"),
      answers: stepAnswers,
      cql: [...stepAnswers.map(option => clauseCql(option.group.match)), ...always].join(" AND "),
    }))
  )
}
