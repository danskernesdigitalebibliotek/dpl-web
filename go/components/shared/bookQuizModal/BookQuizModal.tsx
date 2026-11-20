"use client"

import { useQueryClient } from "@tanstack/react-query"
import { MotionConfig, motion } from "framer-motion"
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
import BookQuizLoading from "./BookQuizLoading"
import BookQuizQuestion from "./BookQuizQuestion"
import BookQuizWatermark from "./BookQuizWatermark"
import StepDots from "./StepDots"
import { QUIZ_COLOR_CLASSES } from "./colors"
import {
  getBookQuizResultUrl,
  getChosenOptions,
  getColorAfterSelect,
  getFurthestStep,
  getSelectedIds,
  getStepEmojis,
  prefetchBookQuizResults,
  selectOption,
} from "./helper"

// How long the loader shows at least, in ms.
const MIN_LOADING_TIME = 4500

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
  const isFinalReady = Boolean(question) && !nextQuestion && selectedIds.length > 0

  const goNext = async (nextAnswers: TBookQuizAnswers) => {
    setAnswers(nextAnswers)
    if (nextQuestion) return flow.goTo(nextQuestion.id)

    flow.goTo("loading")
    // Keeps the loader up long enough to be seen, even when the books come fast.
    await Promise.all([
      prefetchBookQuizResults(queryClient, nextAnswers),
      new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME)),
    ])
    router.push(getBookQuizResultUrl(nextAnswers))
    // The host closes modals on route changes, but not when the quiz is
    // retaken from the result page, where only the query changes.
    onClose()
  }

  // Back along the path taken, or forward through each question in between,
  // so the back button still retraces the questions one by one.
  const goToStep = (index: number) => {
    if (index < questionIndex) return flow.backTo(QUESTIONS[index].id)
    QUESTIONS.slice(questionIndex + 1, index + 1).forEach(step => flow.goTo(step.id))
  }

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent
        size="wide"
        aria-describedby={undefined}
        className={cn(
          QUIZ_COLOR_CLASSES[color],
          // The quiz is made to fit: the spacing shrinks with the height of the
          // screen. It only scrolls when that is not enough, e.g. when zoomed in.
          // The colours are transitioned here, on the variables, so the background
          // and the watermark change at the same time.
          `dark:bg-background-overlay-solid grid-rows-[auto_1fr_auto] overflow-y-auto bg-(--quiz-bg)
          transition-[--quiz-bg,--quiz-shape] duration-500`
        )}
        data-cy={cyKeys["book-quiz-modal"]}>
        {/* Runs off the bottom right corner, clear of the centred content. */}
        <BookQuizWatermark className="-right-[18%] -bottom-[35%] w-[140%] lg:-right-[6%] lg:w-[88%]" />
        {/* The close and back buttons live inside DialogTitle, so they are made
            white from here, to stand out on the coloured background. */}
        <DialogHeader
          className="px-grid-edge pt-grid-edge [&_button]:bg-background pb-3 lg:px-10
            lg:pt-[clamp(16px,4dvh,40px)] lg:pb-[clamp(8px,2.4dvh,24px)]">
          {/* Hidden: each view has its own heading. The title keeps its space, so
              the close button stays in the corner, and still names the dialog
              through aria-labelledby. It is at least as high as the buttons, so
              they are as far from the top as from the sides. */}
          <DialogTitle
            className="invisible min-h-10 px-10"
            onBack={question && flow.canGoBack ? () => flow.back() : undefined}>
            Læsefavoritter
          </DialogTitle>
        </DialogHeader>
        <DialogBody
          className="px-grid-edge mx-auto flex w-full max-w-[960px] flex-col pt-2
            pb-[clamp(8px,6dvh_-_24px,48px)]">
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
                <BookQuizLoading options={getChosenOptions(answers)} />
              )
            )}
          </div>
          {question && (
            <div
              className="mt-[clamp(12px,5dvh,40px)] flex flex-col items-center
                gap-[clamp(6px,2dvh,16px)]">
              {/* The last step stands out: sparkles and a gentle pulse
                  once an answer is chosen. Reduced motion turns the pulse off. */}
              <MotionConfig reducedMotion="user">
                <motion.div
                  animate={isFinalReady ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={
                    isFinalReady ? { duration: 1.2, repeat: Infinity, repeatDelay: 1 } : undefined
                  }>
                  <Button
                    theme="primary"
                    size="lg"
                    className={cn("min-w-[200px]", !nextQuestion && "gap-3")}
                    data-cy={cyKeys["book-quiz-next-button"]}
                    onClick={() => goNext(answers)}
                    disabled={selectedIds.length === 0}>
                    {nextQuestion ? (
                      "Næste"
                    ) : (
                      <>
                        Find mine bøger
                        <span aria-hidden="true" className="text-[24px] leading-none">
                          ✨
                        </span>
                      </>
                    )}
                  </Button>
                </motion.div>
              </MotionConfig>
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
          <div
            className="bg-background px-grid-edge flex justify-center py-[clamp(8px,2dvh,16px)]
              lg:px-10 lg:py-[clamp(8px,3dvh,24px)]">
            <StepDots
              emojis={getStepEmojis(answers)}
              current={questionIndex}
              furthest={getFurthestStep(answers)}
              onSelect={goToStep}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BookQuizModal
