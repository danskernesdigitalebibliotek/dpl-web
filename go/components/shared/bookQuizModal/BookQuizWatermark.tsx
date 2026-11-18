import React from "react"

import type { TBookQuizColor } from "@/lib/book-quiz/groups"
import { cn } from "@/lib/helpers/helper.cn"

import { QUIZ_COLOR_CLASSES } from "./colors"

type TBookQuizWatermarkProps = {
  color: TBookQuizColor
  // Size and position of the shape.
  className: string
}

// A large shape behind the content, cut off at the edges of the nearest
// positioned parent, which needs `isolate` so the shape stays inside it. The
// SVG is used as a mask, so its colour comes from the background. Not Icon:
// SVGR drops the viewBox, so Icon can't scale it.
const BookQuizWatermark = ({ color, className }: TBookQuizWatermarkProps) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div
      className={cn(
        QUIZ_COLOR_CLASSES[color].shape,
        `absolute aspect-[196/198] -rotate-12 mask-[url(/icons/abstract-shape.svg)] mask-contain
        mask-no-repeat transition-colors duration-500 dark:opacity-15`,
        className
      )}
    />
  </div>
)

export default BookQuizWatermark
