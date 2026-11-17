import type { QueryClient } from "@tanstack/react-query"

import type { TBookQuizColor } from "@/lib/book-quiz/groups"
import { getLadderSteps, getStepQueryVariables } from "@/lib/book-quiz/ladder"
import { type TBookQuizAnswers, getBookQuizProfile } from "@/lib/book-quiz/profile"
import {
  QUESTIONS,
  type TBookQuizQuestion,
  type TBookQuizQuestionId,
} from "@/lib/book-quiz/questions"
import { serializeBookQuizAnswers } from "@/lib/book-quiz/url"
import goConfig from "@/lib/config/goConfig"
import { useComplexSearchForBookQuizQuery } from "@/lib/graphql/generated/fbi/graphql"

export const getSelectedIds = (answers: TBookQuizAnswers, id: TBookQuizQuestionId): string[] =>
  [answers[id] ?? []].flat()

// Multi questions toggle the option, the others replace the answer.
export const selectOption = (
  answers: TBookQuizAnswers,
  question: TBookQuizQuestion,
  optionId: string
): TBookQuizAnswers => {
  if (!question.multi) return { ...answers, [question.id]: optionId }

  const selected = getSelectedIds(answers, question.id)
  return {
    ...answers,
    [question.id]: selected.includes(optionId)
      ? selected.filter(id => id !== optionId)
      : [...selected, optionId],
  }
}

// The emoji of each question's answer for the progress circles. Multi
// questions show their first choice.
export const getStepEmojis = (answers: TBookQuizAnswers) =>
  QUESTIONS.map(question => {
    const [selectedId] = getSelectedIds(answers, question.id)
    return question.options.find(option => option.id === selectedId)?.emoji
  })

// The colour of the chosen option's group. Options without a group, and
// unselecting, keep the current colour.
export const getColorAfterSelect = (
  color: TBookQuizColor,
  answers: TBookQuizAnswers,
  question: TBookQuizQuestion,
  optionId: string
): TBookQuizColor => {
  if (!getSelectedIds(answers, question.id).includes(optionId)) return color
  return question.options.find(option => option.id === optionId)?.group?.color ?? color
}

export const getBookQuizResultUrl = (answers: TBookQuizAnswers) =>
  serializeBookQuizAnswers(`/${goConfig("routes.book-quiz")}`, answers)

// Puts the books for every step in the query cache, so the result page shows
// them at once. A failed step is not cached and is fetched again by the page.
export const prefetchBookQuizResults = (queryClient: QueryClient, answers: TBookQuizAnswers) =>
  Promise.all(
    getLadderSteps(getBookQuizProfile(answers)).flatMap(({ cql }) => {
      if (!cql) return []
      const variables = getStepQueryVariables(cql)
      return queryClient.prefetchQuery({
        queryKey: useComplexSearchForBookQuizQuery.getKey(variables),
        queryFn: useComplexSearchForBookQuizQuery.fetcher(variables),
      })
    })
  )
