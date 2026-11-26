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
  <div className="flex flex-col items-center gap-[clamp(12px,3dvh,24px)] text-center">
    <h2 className="text-typo-heading-3 lg:text-typo-heading-2">{question.title}</h2>
    {question.multi && <p className="text-typo-body-lg">Vælg en eller flere</p>}
    {/* Two even columns on small screens, so all the options fit without
        scrolling. Pills that wrap freely from sm. */}
    <ul
      className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-center
        sm:gap-x-3 sm:gap-y-[clamp(6px,1.5dvh,12px)]">
      {question.options.map(option => {
        const isSelected = selectedIds.includes(option.id)
        return (
          <li key={option.id} className="last:odd:col-span-2">
            <Button
              variant="option"
              theme={isSelected ? "primary" : "secondary"}
              aria-pressed={isSelected}
              className="h-full w-full gap-2 px-3 sm:h-auto sm:w-auto sm:gap-3 sm:px-8"
              data-cy={cyKeys["book-quiz-option"]}
              onClick={() => onSelect(option.id)}>
              {option.emoji && (
                <span aria-hidden="true" className="text-[24px] leading-none sm:text-[28px]">
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
