import type { TBookQuizColor, TBookQuizGroup } from "./groups"
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

const hasGroup = (option?: TBookQuizOption): option is TBookQuizOption => Boolean(option?.group)

// The chosen options that search on a group, per question. Used to show the
// answers behind each result section.
export const getGroupAnswers = (
  answers: TBookQuizAnswers
): Record<"genre" | "mood" | "subjects", TBookQuizOption[]> => ({
  genre: [findOption("genre", answers.genre)].filter(hasGroup),
  mood: [findOption("mood", answers.mood)].filter(hasGroup),
  subjects: (answers.subjects ?? [])
    .map(optionId => findOption("subjects", optionId))
    .filter(hasGroup),
})

// The colour of the result page: genre first, then mood, then the first
// subject with a colour, as in the quiz.
export const getBookQuizColor = (profile: TBookQuizProfile): TBookQuizColor =>
  profile.genre?.color ??
  profile.mood?.color ??
  profile.subjects.find(group => group.color)?.color ??
  "green"

export const getBookQuizProfile = (answers: TBookQuizAnswers): TBookQuizProfile => ({
  genre: findOption("genre", answers.genre)?.group,
  mood: findOption("mood", answers.mood)?.group,
  subjects: (answers.subjects ?? []).flatMap(
    optionId => findOption("subjects", optionId)?.group ?? []
  ),
  ageRange: findOption("age", answers.age)?.ageRange,
  easyToRead: Boolean(findOption("level", answers.level)?.easyToRead),
})
