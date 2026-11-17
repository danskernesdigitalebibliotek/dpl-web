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
import type { TBookQuizAnswers } from "@/lib/book-quiz/profile"
import { QUESTIONS, type TBookQuizQuestionId } from "@/lib/book-quiz/questions"

import BookQuizQuestion from "./BookQuizQuestion"
import StepDots from "./StepDots"
import {
  getBookQuizResultUrl,
  getSelectedIds,
  prefetchBookQuizResults,
  selectOption,
} from "./helper"

// The quiz takes no props. `open`/`onClose` come from the DynamicModal host.
export type BookQuizModalProps = object

// One view per question, then a loader while the books are fetched into the
// cache. The result page then shows them without loading.
const BookQuizModal = ({
  open,
  onClose,
}: BookQuizModalProps & { open: boolean; onClose: () => void }) => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const flow = useModalFlow<TBookQuizQuestionId | "loading">({ initial: QUESTIONS[0].id })
  const [answers, setAnswers] = useState<TBookQuizAnswers>({})

  const questionIndex = QUESTIONS.findIndex(question => question.id === flow.view)
  const question = QUESTIONS[questionIndex]
  const nextQuestion = QUESTIONS[questionIndex + 1]

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
      <DialogContent size="wide" aria-describedby={undefined} className="grid-rows-[auto_1fr_auto]">
        <DialogHeader className="p-grid-edge border-b">
          <DialogTitle>Læsefavoritter</DialogTitle>
        </DialogHeader>
        <DialogBody className="p-grid-edge flex flex-col justify-center">
          {flow.renderBody(
            question ? (
              <BookQuizQuestion
                question={question}
                selectedIds={getSelectedIds(answers, question.id)}
                onSelect={optionId => setAnswers(selectOption(answers, question, optionId))}
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
        </DialogBody>
        {question && (
          <div className="p-grid-edge flex flex-wrap items-center justify-between gap-4">
            <Button onClick={() => flow.back()} disabled={!flow.canGoBack}>
              Forrige
            </Button>
            <StepDots count={QUESTIONS.length} current={questionIndex} />
            <div className="flex gap-2">
              <Button onClick={() => goNext({ ...answers, [question.id]: null })}>
                Spring over
              </Button>
              <Button
                theme="primary"
                onClick={() => goNext(answers)}
                disabled={getSelectedIds(answers, question.id).length === 0}>
                {nextQuestion ? "Næste" : "Se dine bøger"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default BookQuizModal
