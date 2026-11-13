import type { TBookQuizGroup } from "./groups"
import {
  type TBookQuizOption,
  type TBookQuizQuestionId,
  type TBookQuizRange,
  getQuestion,
} from "./questions"

// The answers as option ids, keyed by question id.
export type TBookQuizAnswers = {
  genre?: string | null
  mood?: string | null
  subjects?: string[] | null
  age?: string | null
  level?: string | null
}

// What the answers mean for the search. Missing parts (skipped questions or
// answers without a mapping) are left out.
export type TBookQuizProfile = {
  genre?: TBookQuizGroup
  mood?: TBookQuizGroup
  subjects: TBookQuizGroup[]
  ageRange?: TBookQuizRange
  easyToRead: boolean
}

const findOption = (
  questionId: TBookQuizQuestionId,
  optionId: string | null | undefined
): TBookQuizOption | undefined =>
  optionId ? getQuestion(questionId).options.find(option => option.id === optionId) : undefined

export const getBookQuizProfile = (answers: TBookQuizAnswers): TBookQuizProfile => ({
  genre: findOption("genre", answers.genre)?.group,
  mood: findOption("mood", answers.mood)?.group,
  subjects: (answers.subjects ?? []).flatMap(optionId => findOption("subjects", optionId)?.group ?? []),
  ageRange: findOption("age", answers.age)?.ageRange,
  easyToRead: Boolean(findOption("level", answers.level)?.easyToRead),
})
