"use client"

import { motion, useReducedMotion } from "framer-motion"
import Image from "next/image"
import React, { useEffect, useState } from "react"

import { cn } from "@/lib/helpers/helper.cn"

// Where the emojis burst from, in % of the photo's size.
const ORIGIN = { left: 50, top: 72 }
// Where each emoji lands, as offsets from the origin in % of the photo's size,
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
  // The width of the photo. The burst scales with it.
  imageClassName?: string
}

// The girl from the quiz, with emojis bursting out around her. With reduced
// motion the emojis are just shown in place.
const BookQuizBurst = ({ emojis, imageClassName = "w-48 lg:w-64" }: TBookQuizBurstProps) => {
  const isReducedMotion = useReducedMotion()
  // The emojis are first rendered at the origin, and the burst is started
  // after mount.
  const [hasBurst, setHasBurst] = useState(false)
  useEffect(() => setHasBurst(true), [])

  return (
    <div className="relative">
      <Image
        src="/images/book-quiz-intro.png"
        alt=""
        width={512}
        height={512}
        priority
        className={cn("h-auto", imageClassName)}
      />
      {emojis.slice(0, POSITIONS.length).map((emoji, index) => {
        const { x, y } = POSITIONS[index]
        return (
          <motion.span
            key={index}
            aria-hidden="true"
            // Starts hidden at the origin without animating there. Otherwise
            // the emojis are first shown below the photo, where they sit in
            // the layout, and fly out from there.
            initial={false}
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 text-[28px]
              leading-none lg:text-[36px]"
            animate={
              hasBurst
                ? {
                    left: `${ORIGIN.left + x}%`,
                    top: `${ORIGIN.top + y}%`,
                    scale: 1,
                    opacity: 1,
                  }
                : { left: `${ORIGIN.left}%`, top: `${ORIGIN.top}%`, scale: 0, opacity: 0 }
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
