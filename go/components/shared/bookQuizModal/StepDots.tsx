import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type TStepDotsProps = {
  // One per question: the emoji of its chosen answer, if any.
  emojis: (string | undefined)[]
  current: number
}

// Progress through the quiz, joined by a line. Questions ahead are small dots,
// which grow into white circles when reached; the current one is the biggest.
// A circle shows the emoji of its answer once chosen. Not links, the questions
// are answered in order.
const StepDots = ({ emojis, current }: TStepDotsProps) => (
  <ol
    className="flex items-center justify-center"
    aria-label={`Spørgsmål ${current + 1} af ${emojis.length}`}>
    {emojis.map((emoji, index) => {
      const isReached = index <= current
      return (
        <li
          key={index}
          aria-current={index === current ? "step" : undefined}
          className="flex items-center">
          {index > 0 && (
            <span
              aria-hidden="true"
              className={cn("h-1 w-6 lg:w-10", isReached ? "bg-foreground" : "bg-foreground/20")}
            />
          )}
          <span
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-300",
              isReached
                ? "border-foreground bg-background h-9 w-9 border"
                : "bg-foreground/25 h-3 w-3",
              index === current && "scale-125 border-2"
            )}>
            {isReached && emoji && (
              <span aria-hidden="true" className="text-[18px] leading-none">
                {emoji}
              </span>
            )}
          </span>
        </li>
      )
    })}
  </ol>
)

export default StepDots
