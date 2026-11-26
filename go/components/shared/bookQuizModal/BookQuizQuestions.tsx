import { motion } from "framer-motion"
import React from "react"

import type { TBookQuizAnswers } from "@/lib/book-quiz/profile"
import { QUESTIONS, type TBookQuizQuestion } from "@/lib/book-quiz/questions"

import BookQuizQuestion from "./BookQuizQuestion"
import { getSelectedIds } from "./helper"

type TBookQuizQuestionsProps = {
  // Index of the question shown.
  current: number
  answers: TBookQuizAnswers
  onSelect: (question: TBookQuizQuestion, optionId: string) => void
}

// All the questions lie on top of each other in one cell, and only the current
// one is shown. The cell is as high as the highest question, and every
// question starts at its top, so the titles sit at the same place and nothing
// moves up or down when the question changes. The old question fades out, and
// the new one fades in with a short slide from the side it comes from.
const BookQuizQuestions = ({ current, answers, onSelect }: TBookQuizQuestionsProps) => (
  <div className="grid">
    {QUESTIONS.map((question, index) => {
      const isCurrent = index === current
      return (
        <motion.div
          key={question.id}
          className="col-start-1 row-start-1"
          // The hidden questions can't be reached by keyboard or screen reader.
          inert={!isCurrent}
          initial={false}
          animate={{ opacity: isCurrent ? 1 : 0, x: isCurrent ? 0 : index < current ? -16 : 16 }}
          transition={
            isCurrent
              ? { duration: 0.22, delay: 0.1, ease: "easeOut" }
              : { duration: 0.12, ease: "easeIn" }
          }>
          <BookQuizQuestion
            question={question}
            selectedIds={getSelectedIds(answers, question.id)}
            onSelect={optionId => onSelect(question, optionId)}
          />
        </motion.div>
      )
    })}
  </div>
)

export default BookQuizQuestions
