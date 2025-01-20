"use client"

import React, { useEffect } from "react"

import type { ParagraphGoVideo as TParagraphGoVideo } from "@/lib/graphql/generated/dpl-cms/graphql"

type ParagraphGoVideoProps = {
  title: TParagraphGoVideo["title"]
  url: TParagraphGoVideo["url"]
}

export default function ParagraphGoVideo(paragraphGoVideo: ParagraphGoVideoProps) {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { title, url } = paragraphGoVideo

  return (
    <div className="content-container grid-go gap-paragraph-spacing-inner">
      <div className="col-span-6 w-full lg:col-span-10 lg:col-start-2">
        <h2 className="text-center text-typo-heading-2">{title}</h2>
      </div>

      <div className="col-span-6 lg:col-span-12">
        <div className="relative aspect-16/9 w-full overflow-hidden rounded-base">
          {mounted && (
            <iframe
              aria-label={title || "Video"}
              className="absolute inset-0 h-full w-full"
              src={url}
              allowFullScreen
              allow="autoplay; fullscreen"></iframe>
          )}
        </div>
      </div>
    </div>
  )
}
