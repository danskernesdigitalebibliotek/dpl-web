"use client"

import React from "react"

type ParagraphGoVideoProps = {
  // TODO: Something has changed and removed the title from the type. Please check.
  // title: TParagraphGoVideo["title"]
  title: string
  // TODO: Something has changed and removed the url from the type. Please check.
  // url: TParagraphGoVideo["url"]
  url: string
}

export default function ParagraphGoVideo(paragraphGoVideo: ParagraphGoVideoProps) {
  const { title, url } = paragraphGoVideo

  return (
    <div className="content-container grid-go gap-paragraph-spacing-inner">
      <div className="col-span-6 w-full lg:col-span-10 lg:col-start-2">
        <h2 className="text-center text-typo-heading-2">{title}</h2>
      </div>
      <div className="col-span-6 lg:col-span-12">
        <div className="relative aspect-16/9 w-full overflow-hidden rounded-base">
          <iframe
            aria-label={title || "Video"}
            className="absolute inset-0 h-full w-full"
            src={url}
            allowFullScreen
            allow="autoplay; fullscreen"></iframe>
        </div>
      </div>
    </div>
  )
}
