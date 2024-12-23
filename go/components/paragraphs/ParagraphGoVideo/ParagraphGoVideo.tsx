"use client"

import React, { useEffect } from "react"

import type { ParagraphGoVideo } from "@/lib/graphql/generated/dpl-cms/graphql"

export default function ParagraphGoVideo(paragraphGoVideo: ParagraphGoVideo) {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { goVideoTitle: title } = paragraphGoVideo

  return (
    <div className="content-container grid-go gap-paragraph-spacing-inner">
      <div className="col-span-6 w-full lg:col-span-10 lg:col-start-2">
        <h2 className="text-center text-typo-heading-2">{title}</h2>
      </div>

      <div className="col-span-6 lg:col-span-12">
        {mounted && (
          <div className="relative aspect-16/9 w-full overflow-hidden rounded-base">
            <iframe
              aria-label="Naja Marie Aidt - Oevelser i moerke"
              className="absolute inset-0 h-full w-full"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%!important",
                height: "100%!important",
              }}
              src="https://media.videotool.dk/?vn=557_2024111913325696587632242634"
              allowFullScreen
              allow="autoplay; fullscreen"></iframe>
          </div>
        )}
      </div>
    </div>
  )
}
