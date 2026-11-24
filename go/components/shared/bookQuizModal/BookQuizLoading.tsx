"use client"

import { motion, useReducedMotion } from "framer-motion"
import React, { useEffect, useState } from "react"

import { buttonVariants } from "@/components/shared/button/Button"
import type { TBookQuizOption } from "@/lib/book-quiz/questions"
import { cn } from "@/lib/helpers/helper.cn"

// Shown one after the other while the books are found.
const MESSAGES = ["Blander dine svar …", "Leder på hylderne …", "Finder dine bøger …"]
const MESSAGE_INTERVAL = 1500

// Seconds one item takes to fly across, and between two items taking off.
const FLIGHT_DURATION = 2.6
const FLIGHT_STAGGER = 0.45
// Where a flight starts (inside the left shape), peaks and ends (inside the
// right shape), in % of the stage. The lists differ in length, so the
// combinations vary from item to item.
const FLIGHT_STARTS = [
  { left: "26%", top: "39%" },
  { left: "31%", top: "50%" },
  { left: "27%", top: "58%" },
  { left: "32%", top: "39%" },
  { left: "24%", top: "48%" },
  { left: "29%", top: "44%" },
  { left: "32%", top: "53%" },
]
const FLIGHT_PEAKS = [
  { left: "50%", top: "12%" },
  { left: "53%", top: "80%" },
  { left: "49%", top: "32%" },
  { left: "52%", top: "90%" },
  { left: "51%", top: "20%" },
  { left: "54%", top: "62%" },
]
const FLIGHT_ENDS = [
  { left: "78%", top: "50%" },
  { left: "80%", top: "44%" },
  { left: "76%", top: "58%" },
  { left: "79%", top: "48%" },
  { left: "77%", top: "55%" },
]

// Geometric shapes that fly along with the answers.
const SHAPES = [
  <span key="circle" className="bg-warning-orange-300 block h-12 w-12 rounded-full" />,
  <svg key="bow" viewBox="0 0 48 32" className="text-warning-orange-300 h-10 w-14" fill="none">
    <path d="M2 4 24 12 46 2 44 30 24 20 4 28Z" stroke="currentColor" strokeWidth="2" />
  </svg>,
  <svg key="cloud" viewBox="0 0 52 48" className="h-14 w-16" fill="none">
    <path
      d="M20 24a12 12 0 1 1 14-14 11 11 0 1 1 6 20 12 12 0 1 1-20-6Z"
      stroke="currentColor"
      strokeWidth="2"
    />
  </svg>,
  <svg key="triangle" viewBox="0 0 32 28" className="text-content-purple-300 h-10 w-12">
    <path d="M16 2 30 26H2Z" fill="currentColor" />
  </svg>,
]

type TBookQuizLoadingProps = {
  // The chosen answers, which fly from one shape into the other.
  options: TBookQuizOption[]
}

// An abstract loader: the answers, their emojis and a few geometric shapes
// fly in arcs out of the left shape and into the right one, in an endless
// stream. With reduced motion only the two shapes and the text are shown.
const BookQuizLoading = ({ options }: TBookQuizLoadingProps) => {
  const isReducedMotion = useReducedMotion()
  const [messageIndex, setMessageIndex] = useState(0)
  useEffect(() => {
    const timer = setInterval(
      () => setMessageIndex(index => Math.min(index + 1, MESSAGES.length - 1)),
      MESSAGE_INTERVAL
    )
    return () => clearInterval(timer)
  }, [])

  // Emoji, answer, shape, emoji, answer, shape …
  const items = options.flatMap((option, index) => [
    ...(option.emoji
      ? [
          <span key={`emoji-${option.id}`} className="text-[44px] leading-none">
            {option.emoji}
          </span>,
        ]
      : []),
    // Looks like the answer button in the quiz, in the same size.
    <span
      key={`label-${option.id}`}
      className={cn(buttonVariants({ variant: "option" }), "whitespace-nowrap")}>
      {option.emoji && <span className="text-[28px] leading-none">{option.emoji}</span>}
      {option.label}
    </span>,
    SHAPES[index % SHAPES.length],
  ])
  // Fills the pause, so the stream is evenly spaced when it loops.
  const repeatDelay = Math.max(0, items.length * FLIGHT_STAGGER - FLIGHT_DURATION)

  return (
    // Nudged up: the modal's header above is empty, so centred content looks
    // too low.
    <div
      role="status"
      className="flex -translate-y-6 flex-col items-center gap-6 text-center lg:-translate-y-10">
      {/* The width also follows the viewport height, so the stage and the text
          below fit in the modal without scrolling: the modal is 85dvh, and
          header, padding and text take about 300px of that. */}
      <div
        aria-hidden="true"
        className="relative aspect-[8/5] w-[min(100%,760px,max(280px,136dvh_-_480px))]">
        {/* The two shapes, drawn in the coordinates of the design sketch: a
            slanted sheet with round corners (the wide stroke rounds them) and
            a tilted oval. */}
        <motion.div
          className="absolute inset-0"
          style={{ originX: 0.28, originY: 0.48 }}
          animate={isReducedMotion ? undefined : { rotate: [0, 3, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}>
          <svg viewBox="0 0 1172 736" className="h-full w-full">
            <path
              d="M172 138 425 128 495 468 265 585Z"
              className="fill-warning-orange-200 stroke-warning-orange-200"
              strokeWidth="44"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
        <motion.div
          className="absolute inset-0"
          style={{ originX: 0.78, originY: 0.52 }}
          animate={isReducedMotion ? undefined : { scale: [1, 1.06, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}>
          <svg viewBox="0 0 1172 736" className="h-full w-full">
            <ellipse
              cx="916"
              cy="380"
              rx="118"
              ry="222"
              transform="rotate(30 916 380)"
              className="fill-content-purple-200"
            />
          </svg>
        </motion.div>
        {!isReducedMotion &&
          items.map((item, index) => {
            const start = FLIGHT_STARTS[index % FLIGHT_STARTS.length]
            const peak = FLIGHT_PEAKS[index % FLIGHT_PEAKS.length]
            const end = FLIGHT_ENDS[index % FLIGHT_ENDS.length]
            const flight = {
              duration: FLIGHT_DURATION,
              delay: index * FLIGHT_STAGGER,
              repeat: Infinity,
              repeatDelay,
              ease: "easeInOut" as const,
            }
            return (
              <motion.div
                key={index}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                initial={{ ...start, scale: 0 }}
                animate={{
                  left: [start.left, peak.left, end.left],
                  top: [start.top, peak.top, end.top],
                  // Grows out of the left shape, is full size over the middle
                  // and shrinks into the right shape.
                  scale: [0, 1, 1, 0],
                  rotate: [-30, 0, index % 2 ? 40 : -40],
                }}
                transition={{ ...flight, scale: { ...flight, times: [0, 0.35, 0.65, 1] } }}>
                {item}
              </motion.div>
            )
          })}
      </div>
      <p className="sr-only">Vi finder dine bøger</p>
      <p aria-hidden="true" className="text-typo-heading-3">
        {MESSAGES[messageIndex]}
      </p>
    </div>
  )
}

export default BookQuizLoading
