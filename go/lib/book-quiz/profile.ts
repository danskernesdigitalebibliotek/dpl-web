import type { TBookQuizColor, TBookQuizGroup } from "./groups"
import {
  type TBookQuizOption,
  type TBookQuizQuestionId,
  type TBookQuizRange,
  getQuestion,
} from "./questions"

// The answers as option ids, keyed by question id. Always a list, also for
// questions with one choice, so a question can be changed between one and
// several choices without anything else changing. Null is a skipped question.
export type TBookQuizAnswers = Partial<Record<TBookQuizQuestionId, string[] | null>>

// What the answers mean for the search. Skipped questions and answers without
// a mapping are left out.
export type TBookQuizProfile = {
  // The groups of the genre, mood and subject answers, in question order.
  groups: TBookQuizGroup[]
  // A book has to be for one of these ages. Empty when no age is asked for.
  ageRanges: TBookQuizRange[]
  easyToRead: boolean
}

// The chosen options of a question. Unknown ids are left out.
const getOptions = (
  answers: TBookQuizAnswers,
  questionId: TBookQuizQuestionId
): TBookQuizOption[] =>
  (answers[questionId] ?? []).flatMap(
    optionId => getQuestion(questionId).options.find(option => option.id === optionId) ?? []
  )

export type TBookQuizGroupOption = TBookQuizOption & { group: TBookQuizGroup }

const hasGroup = (option: TBookQuizOption): option is TBookQuizGroupOption => Boolean(option.group)

// The questions whose answers search on a group.
const GROUP_QUESTIONS: TBookQuizQuestionId[] = ["genre", "mood", "subjects"]

// The chosen options that search on a group, in question order. Every one of
// them counts as its own answer, also when several are chosen in one question.
export const getGroupAnswers = (answers: TBookQuizAnswers): TBookQuizGroupOption[] =>
  GROUP_QUESTIONS.flatMap(questionId => getOptions(answers, questionId)).filter(hasGroup)

// The colour of the result page: that of the first answer with a colour, as in
// the quiz.
export const getBookQuizColor = (profile: TBookQuizProfile): TBookQuizColor =>
  profile.groups.find(group => group.color)?.color ?? "green"

// What the chosen options of a question filter on, e.g. their age ranges. With
// several choices they are alternatives: a book has to fit one of them. An
// option that filters on nothing fits every book, so with one among the choices
// the question filters nothing.
const getAlternatives = <T>(
  options: TBookQuizOption[],
  getFilter: (option: TBookQuizOption) => T | undefined
): T[] => {
  const filters = options.map(getFilter)
  return filters.every((filter): filter is T => filter !== undefined) ? filters : []
}

export const getBookQuizProfile = (answers: TBookQuizAnswers): TBookQuizProfile => ({
  groups: getGroupAnswers(answers).map(option => option.group),
  ageRanges: getAlternatives(getOptions(answers, "age"), option => option.ageRange),
  easyToRead:
    getAlternatives(getOptions(answers, "level"), option => option.easyToRead || undefined).length >
    0,
})
