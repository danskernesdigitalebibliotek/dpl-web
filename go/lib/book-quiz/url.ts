import { createLoader, createSerializer, parseAsArrayOf, parseAsStringLiteral } from "nuqs/server"

import { getOptionIds } from "./questions"

// The answers live in the result page URL as option ids, never as CQL, so the
// page can be shared, bookmarked and reloaded. Every question is a list, so a
// question with one choice and one with several look the same here. Unknown ids
// parse to null and are ignored.
const bookQuizParsers = {
  genre: parseAsArrayOf(parseAsStringLiteral(getOptionIds("genre"))),
  mood: parseAsArrayOf(parseAsStringLiteral(getOptionIds("mood"))),
  subjects: parseAsArrayOf(parseAsStringLiteral(getOptionIds("subjects"))),
  age: parseAsArrayOf(parseAsStringLiteral(getOptionIds("age"))),
  level: parseAsArrayOf(parseAsStringLiteral(getOptionIds("level"))),
}

export const loadBookQuizAnswers = createLoader(bookQuizParsers)
export const serializeBookQuizAnswers = createSerializer(bookQuizParsers)
