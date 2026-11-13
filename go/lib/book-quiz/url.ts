import {
  createLoader,
  createSerializer,
  type inferParserType,
  parseAsArrayOf,
  parseAsStringLiteral,
} from "nuqs"

import { getOptionIds } from "./questions"

// The answers live in the result page URL as option ids, never as CQL, so the
// page can be shared, bookmarked and reloaded. Unknown ids parse to null and
// are ignored. The same parsers are used by the modal (serializer), the server
// page (loader) and the client view (useQueryStates).
export const bookQuizParsers = {
  genre: parseAsStringLiteral(getOptionIds("genre")),
  mood: parseAsStringLiteral(getOptionIds("mood")),
  subjects: parseAsArrayOf(parseAsStringLiteral(getOptionIds("subjects"))),
  age: parseAsStringLiteral(getOptionIds("age")),
  level: parseAsStringLiteral(getOptionIds("level")),
}

export type TBookQuizAnswers = inferParserType<typeof bookQuizParsers>

export const serializeBookQuizAnswers = createSerializer(bookQuizParsers)
export const loadBookQuizAnswers = createLoader(bookQuizParsers)
