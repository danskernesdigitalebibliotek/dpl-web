import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type TStepDotsProps = {
  count: number
  current: number
}

// Progress through the quiz. Not links, the questions are answered in order.
const StepDots = ({ count, current }: TStepDotsProps) => (
  <ol className="flex justify-center gap-2" aria-label={`Spørgsmål ${current + 1} af ${count}`}>
    {Array.from({ length: count }, (_, index) => (
      <li
        key={index}
        aria-current={index === current ? "step" : undefined}
        className={cn(
          "bg-foreground h-2 w-2 rounded-full",
          index === current ? "opacity-100" : "opacity-20"
        )}
      />
    ))}
  </ol>
)

export default StepDots
