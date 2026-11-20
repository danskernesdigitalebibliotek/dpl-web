import React from "react"

import { cn } from "@/lib/helpers/helper.cn"

type TBookQuizWatermarkProps = {
  // Size and position of the shape.
  className: string
}

// A large shape behind the content, cut off at the edges of the nearest
// positioned parent, which needs `isolate` so the shape stays inside it. The
// SVG is used as a mask, so its colour comes from the background, which is
// the --quiz-shape of the parent, see QUIZ_COLOR_CLASSES. Not Icon: SVGR drops
// the viewBox, so Icon can't scale it.
const BookQuizWatermark = ({ className }: TBookQuizWatermarkProps) => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div
      className={cn(
        `absolute aspect-[196/198] -rotate-12 bg-(--quiz-shape)
        mask-[url(/icons/abstract-shape.svg)] mask-contain mask-no-repeat dark:opacity-15`,
        className
      )}
    />
  </div>
)

export default BookQuizWatermark
