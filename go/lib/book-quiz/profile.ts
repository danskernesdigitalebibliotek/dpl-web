import type { TBookQuizGroup } from "./groups"
import {
  type TBookQuizOption,
  type TBookQuizQuestionId,
  type TBookQuizRange,
  getQuestion,
} from "./questions"
import type { TBookQuizAnswers } from "./url"

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

export const getBookQuizProfile = (answers: Partial<TBookQuizAnswers>): TBookQuizProfile => ({
  genre: findOption("genre", answers.genre)?.group,
  mood: findOption("mood", answers.mood)?.group,
  subjects: (answers.subjects ?? []).flatMap(optionId => findOption("subjects", optionId)?.group ?? []),
  ageRange: findOption("age", answers.age)?.ageRange,
  easyToRead: Boolean(findOption("level", answers.level)?.easyToRead),
})
