import type { TBookQuizColor } from "@/lib/book-quiz/groups"

// Sets the background and watermark colour of a quiz surface, as the variables
// --quiz-bg and --quiz-shape. The surface uses bg-(--quiz-bg) and the
// watermark inside it bg-(--quiz-shape). Both are registered as colours in
// globals.css, so a surface can transition them, and the background and the
// watermark then change as one. Literal classes, so Tailwind finds them. Shared
// by the quiz modal and the hero on the result page.
//
// Only the existing content colours are used: the light shade as background
// and the strong shade as watermark. Pink's strong shade is 300, not 200.
export const QUIZ_COLOR_CLASSES: Record<TBookQuizColor, string> = {
  green: "[--quiz-bg:var(--success-green-100)] [--quiz-shape:var(--go-green)]",
  pink: "[--quiz-bg:var(--content-pink-100)] [--quiz-shape:var(--content-pink-300)]",
  blue: "[--quiz-bg:var(--content-blue-100)] [--quiz-shape:var(--content-blue-200)]",
  purple: "[--quiz-bg:var(--content-purple-100)] [--quiz-shape:var(--content-purple-200)]",
  orange: "[--quiz-bg:var(--content-orange-100)] [--quiz-shape:var(--content-orange-200)]",
}
