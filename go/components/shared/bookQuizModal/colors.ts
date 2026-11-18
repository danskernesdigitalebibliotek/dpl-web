import type { TBookQuizColor } from "@/lib/book-quiz/groups"

// Literal classes per colour, so Tailwind finds them. Shared by the quiz modal
// and the hero on the result page.
export const QUIZ_COLOR_CLASSES: Record<TBookQuizColor, { background: string; shape: string }> = {
  green: { background: "bg-quiz-green-bg", shape: "bg-quiz-green-shape" },
  pink: { background: "bg-quiz-pink-bg", shape: "bg-quiz-pink-shape" },
  yellow: { background: "bg-quiz-yellow-bg", shape: "bg-quiz-yellow-shape" },
  blue: { background: "bg-quiz-blue-bg", shape: "bg-quiz-blue-shape" },
  purple: { background: "bg-quiz-purple-bg", shape: "bg-quiz-purple-shape" },
  orange: { background: "bg-quiz-orange-bg", shape: "bg-quiz-orange-shape" },
  teal: { background: "bg-quiz-teal-bg", shape: "bg-quiz-teal-shape" },
  red: { background: "bg-quiz-red-bg", shape: "bg-quiz-red-shape" },
  spooky: { background: "bg-quiz-spooky-bg", shape: "bg-quiz-spooky-shape" },
  sand: { background: "bg-quiz-sand-bg", shape: "bg-quiz-sand-shape" },
  lime: { background: "bg-quiz-lime-bg", shape: "bg-quiz-lime-shape" },
}
