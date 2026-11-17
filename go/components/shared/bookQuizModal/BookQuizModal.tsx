"use client"

import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/shared/dialog/dialog"
import { useModalFlow } from "@/components/shared/modalFlow/useModalFlow"
import { cyKeys } from "@/cypress/support/constants"
import type { TBookQuizColor } from "@/lib/book-quiz/groups"
import type { TBookQuizAnswers } from "@/lib/book-quiz/profile"
import { QUESTIONS, type TBookQuizQuestionId } from "@/lib/book-quiz/questions"
import { cn } from "@/lib/helpers/helper.cn"

import BookQuizIntro from "./BookQuizIntro"
import BookQuizQuestion from "./BookQuizQuestion"
import StepDots from "./StepDots"
import {
  getBookQuizResultUrl,
  getColorAfterSelect,
  getSelectedIds,
  getStepEmojis,
  prefetchBookQuizResults,
  selectOption,
} from "./helper"

// Literal classes per colour, so Tailwind finds them.
const COLOR_CLASSES: Record<TBookQuizColor, { background: string; shape: string }> = {
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

// The quiz takes no props. `open`/`onClose` come from the DynamicModal host.
export type BookQuizModalProps = object

// An intro, one view per question, then a loader while the books are fetched
// into the cache. The result page then shows them without loading.
const BookQuizModal = ({
  open,
  onClose,
}: BookQuizModalProps & { open: boolean; onClose: () => void }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const flow = useModalFlow<"intro" | TBookQuizQuestionId | "loading">({ initial: "intro" })
  const [answers, setAnswers] = useState<TBookQuizAnswers>({})
  // Follows the last chosen answer, see getColorAfterSelect.
  const [color, setColor] = useState<TBookQuizColor>("green")

  const questionIndex = QUESTIONS.findIndex(question => question.id === flow.view)
  const question = QUESTIONS[questionIndex]
  const nextQuestion = QUESTIONS[questionIndex + 1]
  const selectedIds = question ? getSelectedIds(answers, question.id) : []

  const goNext = async (nextAnswers: TBookQuizAnswers) => {
    setAnswers(nextAnswers)
    if (nextQuestion) return flow.goTo(nextQuestion.id)

    flow.goTo("loading")
    await prefetchBookQuizResults(queryClient, nextAnswers)
    router.push(getBookQuizResultUrl(nextAnswers))
    // The host closes modals on route changes, but not when the quiz is
    // retaken from the result page, where only the query changes.
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        size="wide"
        aria-describedby={undefined}
        className={cn(
          COLOR_CLASSES[color].background,
          `dark:bg-background-overlay-solid grid-rows-[auto_1fr_auto] transition-colors
          duration-500`
        )}
        data-cy={cyKeys["book-quiz-modal"]}>
        {/* Large watermark behind the content, running off the bottom right corner
            so its edges stay clear of the centred content. */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          {/* The SVG is used as a mask, so the colour comes from the background.
              Not Icon: SVGR drops the viewBox, so Icon can't scale it. */}
          <div
            className={cn(
              COLOR_CLASSES[color].shape,
              `absolute -right-[18%] -bottom-[35%] aspect-[196/198] w-[140%] -rotate-12
              mask-[url(/icons/abstract-shape.svg)] mask-contain mask-no-repeat transition-colors
              duration-500 lg:-right-[6%] lg:w-[88%] dark:opacity-15`
            )}
          />
        </div>
        {/* The close and back buttons live inside DialogTitle, so they are made
            white from here, to stand out on the coloured background. */}
        <DialogHeader className="p-grid-edge [&_button]:bg-background lg:px-10 lg:pt-10 lg:pb-6">
          {/* Hidden: each view has its own heading. The title keeps its space, so
              the close button stays in the corner, and still names the dialog
              through aria-labelledby. */}
          <DialogTitle
            className="invisible px-10"
            onBack={question && flow.canGoBack ? () => flow.back() : undefined}>
            Læsefavoritter
          </DialogTitle>
        </DialogHeader>
        <DialogBody className="p-grid-edge mx-auto flex w-full max-w-[960px] flex-col">
          {/* The question fills the space, so the buttons sit at the bottom. */}
          <div className="flex flex-1 flex-col justify-center">
            {flow.renderBody(
              flow.view === "intro" ? (
                <BookQuizIntro
                  questionCount={QUESTIONS.length}
                  onStart={() => flow.goTo(QUESTIONS[0].id)}
                />
              ) : question ? (
                <BookQuizQuestion
                  question={question}
                  selectedIds={selectedIds}
                  onSelect={optionId => {
                    const nextAnswers = selectOption(answers, question, optionId)
                    setAnswers(nextAnswers)
                    setColor(getColorAfterSelect(color, nextAnswers, question, optionId))
                  }}
                />
              ) : (
                <div role="status" className="flex flex-col items-center gap-4 text-center">
                  <p aria-hidden="true" className="text-typo-heading-2">
                    💣 🦄 🧪 🪐 🕰️
                  </p>
                  <p className="text-typo-heading-3">Vi har næsten noget</p>
                </div>
              )
            )}
          </div>
          {question && (
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button
                theme="primary"
                size="lg"
                className="min-w-[200px]"
                data-cy={cyKeys["book-quiz-next-button"]}
                onClick={() => goNext(answers)}
                disabled={selectedIds.length === 0}>
                {nextQuestion ? "Næste" : "Se dine bøger"}
              </Button>
              <button
                type="button"
                className="text-typo-button-sm hover:underline"
                data-cy={cyKeys["book-quiz-skip-button"]}
                onClick={() => goNext({ ...answers, [question.id]: null })}>
                Spring over
              </button>
            </div>
          )}
        </DialogBody>
        {/* Same padding as the actions bar in ResponsiveDialog. */}
        {question && (
          <div className="bg-background px-grid-edge flex justify-center py-4 lg:px-10 lg:py-6">
            <StepDots emojis={getStepEmojis(answers)} current={questionIndex} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BookQuizModal
