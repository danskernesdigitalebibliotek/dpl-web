import { createLoader, createSerializer, parseAsArrayOf, parseAsStringLiteral } from "nuqs/server"

import { getOptionIds } from "./questions"

// The answers live in the result page URL as option ids, never as CQL, so the
// page can be shared, bookmarked and reloaded. Unknown ids parse to null and
// are ignored.
const bookQuizParsers = {
  genre: parseAsStringLiteral(getOptionIds("genre")),
  mood: parseAsStringLiteral(getOptionIds("mood")),
  subjects: parseAsArrayOf(parseAsStringLiteral(getOptionIds("subjects"))),
  age: parseAsStringLiteral(getOptionIds("age")),
  level: parseAsStringLiteral(getOptionIds("level")),
}

export const loadBookQuizAnswers = createLoader(bookQuizParsers)
export const serializeBookQuizAnswers = createSerializer(bookQuizParsers)
