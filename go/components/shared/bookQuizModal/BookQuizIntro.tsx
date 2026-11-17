"use client"

import { MotionConfig, motion } from "framer-motion"
import Image from "next/image"
import React, { useEffect, useState } from "react"

import { Button } from "@/components/shared/button/Button"
import { cyKeys } from "@/cypress/support/constants"

type TBookQuizIntroProps = {
  questionCount: number
  onStart: () => void
}

// Emojis that burst out of the flask, as offsets in px from it.
const BURST = [
  { emoji: "🦄", x: -130, y: -150 },
  { emoji: "📚", x: 120, y: -170 },
  { emoji: "😂", x: -40, y: -230 },
  { emoji: "🪐", x: 60, y: -250 },
  { emoji: "🐶", x: -160, y: -40 },
  { emoji: "💣", x: 160, y: -60 },
  { emoji: "🕰️", x: -190, y: -120 },
  { emoji: "🧪", x: 190, y: -130 },
  { emoji: "👻", x: -100, y: -260 },
  { emoji: "✨", x: 0, y: -290 },
]

// What the quiz is about, before the first question.
const BookQuizIntro = ({ questionCount, onStart }: TBookQuizIntroProps) => {
  // The modal's view transition turns off initial animations, so the burst is
  // started after mount instead, when the modal opens.
  const [hasBurst, setHasBurst] = useState(false)
  useEffect(() => setHasBurst(true), [])

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {/* With reduced motion the emojis are just shown in place. */}
      <MotionConfig reducedMotion="user">
        <div className="relative">
          <Image
            src="/images/book-quiz-intro.png"
            alt=""
            width={384}
            height={384}
            priority
            className="h-auto w-48 lg:w-64"
          />
          {BURST.map(({ emoji, x, y }, index) => (
            <motion.span
              key={emoji}
              aria-hidden="true"
              className="text-typo-heading-3 pointer-events-none absolute top-[72%] left-1/2 -mt-4
                -ml-4"
              animate={
                hasBurst ? { x, y, scale: 1, opacity: 1 } : { x: 0, y: 0, scale: 0, opacity: 0 }
              }
              transition={{ delay: 0.3 + index * 0.1, duration: 0.7, ease: "backOut" }}>
              {emoji}
            </motion.span>
          ))}
        </div>
      </MotionConfig>
      <h2 className="text-typo-heading-3 lg:text-typo-heading-2">Find din næste yndlingsbog</h2>
      <p className="text-typo-body-lg max-w-[560px]">
        Svar på {questionCount} hurtige spørgsmål om, hvad du kan lide. Så finder vi bøger, der
        passer til dig. Du kan altid springe et spørgsmål over.
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
}

export default BookQuizIntro
