import type { TBookQuizColor } from "@/lib/book-quiz/groups"

// Sets the background and watermark colour of a quiz surface, as the variables
// --quiz-bg and --quiz-shape. The surface uses bg-(--quiz-bg) and the
// watermark inside it bg-(--quiz-shape). Both are registered as colours in
// globals.css, so a surface can transition them, and the background and the
// watermark then change as one. Literal classes, so Tailwind finds them. Shared
// by the quiz modal and the hero on the result page.
export const QUIZ_COLOR_CLASSES: Record<TBookQuizColor, string> = {
  green: "[--quiz-bg:var(--quiz-green-bg)] [--quiz-shape:var(--quiz-green-shape)]",
  pink: "[--quiz-bg:var(--quiz-pink-bg)] [--quiz-shape:var(--quiz-pink-shape)]",
  yellow: "[--quiz-bg:var(--quiz-yellow-bg)] [--quiz-shape:var(--quiz-yellow-shape)]",
  blue: "[--quiz-bg:var(--quiz-blue-bg)] [--quiz-shape:var(--quiz-blue-shape)]",
  purple: "[--quiz-bg:var(--quiz-purple-bg)] [--quiz-shape:var(--quiz-purple-shape)]",
  orange: "[--quiz-bg:var(--quiz-orange-bg)] [--quiz-shape:var(--quiz-orange-shape)]",
  teal: "[--quiz-bg:var(--quiz-teal-bg)] [--quiz-shape:var(--quiz-teal-shape)]",
  red: "[--quiz-bg:var(--quiz-red-bg)] [--quiz-shape:var(--quiz-red-shape)]",
  spooky: "[--quiz-bg:var(--quiz-spooky-bg)] [--quiz-shape:var(--quiz-spooky-shape)]",
  sand: "[--quiz-bg:var(--quiz-sand-bg)] [--quiz-shape:var(--quiz-sand-shape)]",
  lime: "[--quiz-bg:var(--quiz-lime-bg)] [--quiz-shape:var(--quiz-lime-shape)]",
}
