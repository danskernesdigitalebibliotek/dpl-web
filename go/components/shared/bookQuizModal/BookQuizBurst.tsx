"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import React, { useEffect, useState } from "react"

// Where the flask is in the photo, in % of its size.
const FLASK = { left: 50, top: 72 }
// Where each emoji lands, as offsets from the flask in % of the photo's size,
// so the burst keeps its shape when the photo is smaller on small screens.
const POSITIONS = [
  { x: -51, y: -59 },
  { x: 47, y: -66 },
  { x: -16, y: -90 },
  { x: 23, y: -98 },
  { x: -63, y: -16 },
  { x: 63, y: -23 },
  { x: -74, y: -47 },
  { x: 74, y: -51 },
  { x: -39, y: -102 },
  { x: 0, y: -113 },
]

type TBookQuizBurstProps = {
  // Up to one per position, the rest are left out.
  emojis: string[]
}

// The girl with the flask, with emojis bursting out of it. With reduced motion
// the emojis are just shown in place.
const BookQuizBurst = ({ emojis }: TBookQuizBurstProps) => {
  const isReducedMotion = useReducedMotion()
  // The emojis are first rendered in the flask, and the burst is started
  // after mount.
  const [hasBurst, setHasBurst] = useState(false)
  useEffect(() => setHasBurst(true), [])

  return (
    <div className="relative">
      <Image
        src="/images/book-quiz-intro.png"
        alt=""
        width={384}
        height={384}
        priority
        className="h-auto w-48 lg:w-64"
      />
      {emojis.slice(0, POSITIONS.length).map((emoji, index) => {
        const { x, y } = POSITIONS[index]
        return (
          <motion.span
            key={index}
            aria-hidden="true"
            // Starts hidden in the flask without animating there. Otherwise
            // the emojis are first shown below the photo, where they sit in
            // the layout, and fly out from there.
            initial={false}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[28px]
              leading-none lg:text-[36px]"
            animate={
              hasBurst
                ? {
                    left: `${FLASK.left + x}%`,
                    top: `${FLASK.top + y}%`,
                    scale: 1,
                    opacity: 1,
                  }
                : { left: `${FLASK.left}%`, top: `${FLASK.top}%`, scale: 0, opacity: 0 }
            }
            transition={
              isReducedMotion
                ? { duration: 0 }
                : { delay: 0.3 + index * 0.1, duration: 0.7, ease: "backOut" }
            }>
            {emoji}
          </motion.span>
        )
      })}
    </div>
  )
}

export default BookQuizBurst
