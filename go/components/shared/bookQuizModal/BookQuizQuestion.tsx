import React from "react"

import { Button } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"
import type { TBookQuizQuestion } from "@/lib/book-quiz/questions"

type TBookQuizQuestionProps = {
  question: TBookQuizQuestion
  selectedIds: string[]
  onSelect: (optionId: string) => void
}

const BookQuizQuestion = ({ question, selectedIds, onSelect }: TBookQuizQuestionProps) => (
  <div className="flex flex-col items-center gap-6 text-center">
    <h2 className="text-typo-heading-3 lg:text-typo-heading-2">{question.title}</h2>
    {question.multi && <p className="text-typo-body-lg">Vælg en eller flere</p>}
    <ul className="flex flex-wrap justify-center gap-3">
      {question.options.map(option => {
        const isSelected = selectedIds.includes(option.id)
        return (
          <li key={option.id}>
            <Button
              variant="option"
              theme={isSelected ? "primary" : "secondary"}
              aria-pressed={isSelected}
              data-cy={cyKeys["book-quiz-option"]}
              onClick={() => onSelect(option.id)}>
              {option.emoji && (
                <span aria-hidden="true" className="text-[28px] leading-none">
                  {option.emoji}
                </span>
              )}
              {option.label}
            </Button>
          </li>
        )
      })}
    </ul>
  </div>
)

export default BookQuizQuestion
