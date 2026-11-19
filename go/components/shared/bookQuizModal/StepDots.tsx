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
// A circle shows the emoji of its answer once chosen. Reached questions are
// buttons, so the user can jump back, and forward again after going back.
const StepDots = ({ emojis, current, furthest, onSelect }: TStepDotsProps) => (
  <ol
    className="flex items-center justify-center"
    aria-label={`Spørgsmål ${current + 1} af ${emojis.length}`}>
    {emojis.map((emoji, index) => {
      const isReached = index <= Math.max(current, furthest)
      const isCurrent = index === current
      const dotClassName = cn(
        "flex items-center justify-center rounded-full transition-all duration-300",
        isReached ? "border-foreground bg-background h-9 w-9 border" : "bg-foreground/25 h-3 w-3",
        isCurrent && "scale-125 border-2"
      )
      const content = isReached && emoji && (
        <span aria-hidden="true" className="text-[18px] leading-none">
          {emoji}
        </span>
      )

      return (
        <li key={index} aria-current={isCurrent ? "step" : undefined} className="flex items-center">
          {index > 0 && (
            <span
              aria-hidden="true"
              className={cn("h-1 w-6 lg:w-10", isReached ? "bg-foreground" : "bg-foreground/20")}
            />
          )}
          {isReached && !isCurrent ? (
            <button
              type="button"
              aria-label={`Gå til spørgsmål ${index + 1}`}
              className={cn(dotClassName, "focus-visible hover:scale-110 hover:cursor-pointer")}
              onClick={() => onSelect(index)}>
              {content}
            </button>
          ) : (
            <span className={dotClassName}>{content}</span>
          )}
        </li>
      )
    })}
  </ol>
)

export default StepDots
