import { AnimatePresence, motion } from "framer-motion"
import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type TStepDotsProps = {
  // One per question: the emoji of its chosen answer, if any.
  emojis: (string | undefined)[]
  current: number
  // The furthest question that can be jumped to, see getFurthestStep.
  furthest: number
  onSelect: (index: number) => void
}

// Progress through the quiz, joined by a line. Questions ahead are small dots,
// which grow into white circles when reached; the current one is the biggest.
// A circle shows the emoji of its answer once chosen. Reached questions can be
// jumped to, back and forward again.
//
// Every step keeps its place and its element in all states: the dots only
// change by scaling, so the row never shifts and every change is animated. The
// line fills from the left as its step is reached, and the emoji pops in.
//
// What is not reached yet is drawn in the theme's own greys, one for light and
// one for dark mode, and not in a toned-down text colour.
const StepDots = ({ emojis, current, furthest, onSelect }: TStepDotsProps) => (
  <ol
    className="flex items-center justify-center"
    aria-label={`Spørgsmål ${current + 1} af ${emojis.length}`}>
    {emojis.map((emoji, index) => {
      const isReached = index <= Math.max(current, furthest)
      const isCurrent = index === current

      return (
        <li key={index} aria-current={isCurrent ? "step" : undefined} className="flex items-center">
          {index > 0 && (
            // Reaches in under the circles on both sides, so it meets the small
            // dots at their edge and is covered by the big ones.
            <span
              aria-hidden="true"
              className="bg-border dark:bg-background-overlay-solid -mx-3 h-1 w-12 overflow-hidden
                lg:w-16">
              <span
                className={cn(
                  `bg-foreground block h-full origin-left transition-transform duration-300 ease-out
                  motion-reduce:transition-none`,
                  isReached ? "scale-x-100" : "scale-x-0"
                )}
              />
            </span>
          )}
          <button
            type="button"
            aria-label={`Gå til spørgsmål ${index + 1}`}
            disabled={!isReached || isCurrent}
            className="group focus-visible relative z-10 h-9 w-9 rounded-full
              enabled:cursor-pointer"
            onClick={() => onSelect(index)}>
            <span
              className={cn(
                `flex h-full w-full items-center justify-center rounded-full border
                transition-[scale,background-color,border-color] duration-300 ease-out
                motion-reduce:transition-none`,
                isReached
                  ? "border-foreground bg-background group-enabled:group-hover:scale-110"
                  : "bg-border dark:bg-background-overlay-solid scale-[0.33] border-transparent",
                isCurrent && "scale-125 border-2"
              )}>
              <AnimatePresence initial={false}>
                {isReached && emoji && (
                  <motion.span
                    key={emoji}
                    aria-hidden="true"
                    className="absolute text-[18px] leading-none"
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, transition: { duration: 0.12 } }}
                    transition={{ type: "spring", stiffness: 420, damping: 18 }}>
                    {emoji}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </button>
        </li>
      )
    })}
  </ol>
)

export default StepDots
