import Image from "next/image"

import { cn } from "@/lib/helpers/helper.cn"

export type VideoEmbedProps = {
  videoUrl: string
  thumbnailUrl?: string | null
  title?: string | null
  aspect: "16/9" | "9/16"
}

const aspectConfig = {
  "16/9": {
    className: "aspect-16/9",
    sizes: "(max-width: 1024px) 100vw, 75vw",
  },
  "9/16": {
    className: "aspect-9/16",
    sizes: "(max-width: 1024px) 100vw, 33vw",
  },
} as const

const VideoEmbed = ({ videoUrl, thumbnailUrl, title, aspect }: VideoEmbedProps) => {
  const label = title || "Video"
  const { className, sizes } = aspectConfig[aspect]

  return (
    <div
      className={cn(
        "rounded-base bg-background-skeleton relative w-full overflow-hidden",
        className
      )}>
      {thumbnailUrl && (
        <Image
          src={thumbnailUrl}
          alt=""
          fill
          sizes={sizes}
          className="object-cover"
          aria-hidden="true"
        />
      )}
      {/* Never hidden while loading: the player page is transparent, so the
          poster shows through until the player has rendered. */}
      <iframe
        title={label}
        aria-label={label}
        className="absolute inset-0 h-full w-full"
        src={videoUrl}
        allowFullScreen
        allow="autoplay; fullscreen"
        loading="lazy"
      />
    </div>
  )
}

export default VideoEmbed
