import React from "react"

import { Button } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"

import BookQuizBurst from "./BookQuizBurst"

type TBookQuizIntroProps = {
  questionCount: number
  onStart: () => void
}

const INTRO_EMOJIS = ["🦄", "📚", "😂", "🪐", "🐶", "💣", "🕰️", "🧪", "👻", "✨"]

// What the quiz is about, before the first question.
const BookQuizIntro = ({ questionCount, onStart }: TBookQuizIntroProps) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <BookQuizBurst emojis={INTRO_EMOJIS} />
    <h2 className="text-typo-heading-3 lg:text-typo-heading-2">Find din næste yndlingsbog</h2>
    <p className="text-typo-body-lg max-w-[560px]">
      Svar på {questionCount} hurtige spørgsmål om, hvad du kan lide. Så finder vi bøger, der passer
      til dig. Du kan altid springe et spørgsmål over.
    </p>
    <Button
      theme="primary"
      size="lg"
      className="min-w-[200px]"
      data-cy={cyKeys["book-quiz-start-button"]}
      onClick={onStart}>
      Start quizzen
    </Button>
  </div>
)

export default BookQuizIntro
