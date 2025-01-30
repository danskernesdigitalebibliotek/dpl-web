"use client"

import React from "react"

import {
  MediaVideotool,
  ParagraphGoVideo as TParagraphGoVideo,
} from "@/lib/graphql/generated/dpl-cms/graphql"

type ParagraphGoVideoProps = {
  title: TParagraphGoVideo["title"]
  embedVideo: {
    mediaVideotool: MediaVideotool["mediaVideotool"]
    name: MediaVideotool["name"]
  }
}

export default function ParagraphGoVideo(paragraphGoVideo: ParagraphGoVideoProps) {
  const { title, embedVideo } = paragraphGoVideo

  return (
    <div className="content-container grid-go gap-paragraph-spacing-inner">
      <div className="col-span-6 w-full lg:col-span-10 lg:col-start-2">
        <h2 className="text-typo-heading-2 text-center">{title}</h2>
      </div>
      <div className="col-span-6 lg:col-span-12">
        <div className="rounded-base relative aspect-16/9 w-full overflow-hidden">
          <iframe
            aria-label={title || "Video"}
            className="absolute inset-0 h-full w-full"
            src={embedVideo?.mediaVideotool}
            allowFullScreen
            allow="autoplay; fullscreen"></iframe>
        </div>
      </div>
    </div>
  )
}
