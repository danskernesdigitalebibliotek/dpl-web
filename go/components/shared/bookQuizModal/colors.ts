import type { TBookQuizColor } from "@/lib/book-quiz/groups"

// Sets the background and watermark colour of a quiz surface, as the variables
// --quiz-bg and --quiz-shape. The surface uses bg-(--quiz-bg) and the
// watermark inside it bg-(--quiz-shape). Both are registered as colours in
// globals.css, so a surface can transition them, and the background and the
// watermark then change as one. Literal classes, so Tailwind finds them. Shared
// by the quiz modal and the hero on the result page.
//
// Only the existing content colours are used: the light shade as background
// and the strong shade as watermark. In dark mode the surface keeps the dark
// background of the site, and the watermark is the dark shade of the colour,
// which light text can be read on. Pink's shades are numbered differently: 300
// is the strong one and 200 the dark one. Green has no content shades, and
// uses the ones the theme lists as content colours 4 and 5.
export const QUIZ_COLOR_CLASSES: Record<TBookQuizColor, string> = {
  green: `[--quiz-bg:var(--success-green-100)] [--quiz-shape:var(--go-green)]
    dark:[--quiz-shape:var(--success-green-500)]`,
  pink: `[--quiz-bg:var(--content-pink-100)] [--quiz-shape:var(--content-pink-300)]
    dark:[--quiz-shape:var(--content-pink-200)]`,
  blue: `[--quiz-bg:var(--content-blue-100)] [--quiz-shape:var(--content-blue-200)]
    dark:[--quiz-shape:var(--content-blue-300)]`,
  purple: `[--quiz-bg:var(--content-purple-100)] [--quiz-shape:var(--content-purple-200)]
    dark:[--quiz-shape:var(--content-purple-300)]`,
  orange: `[--quiz-bg:var(--content-orange-100)] [--quiz-shape:var(--content-orange-200)]
    dark:[--quiz-shape:var(--content-orange-300)]`,
}

// The result page without answers: the strong shade as background and the dark
// shade as watermark, so it stands apart from the colours of the answers.
export const QUIZ_EMPTY_COLOR_CLASSES =
  "[--quiz-bg:var(--content-purple-200)] [--quiz-shape:var(--content-purple-300)]"
