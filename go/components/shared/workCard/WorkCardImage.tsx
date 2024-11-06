import { useWindowSize } from "@uidotdev/usehooks"
import { log } from "console"
import { motion } from "framer-motion"
import Image from "next/image"
import React, { FC, useEffect, useRef, useState } from "react"
import Tilt from "react-parallax-tilt"

import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

interface Props {
  lowResSrc: string
  src: string
  className?: string
  alt: string
}
export const WorkCardImage: FC<Props> = ({ src, lowResSrc, alt }) => {
  const size = useWindowSize()

  const [imageHeight, setImageHeight] = useState(0)
  const [imageWidth, setImageWidth] = useState(0)
  const imageAspectRatio = imageWidth / imageHeight

  // get the container height
  const ref = useRef<HTMLDivElement>(null)
  const containerHeight = ref.current?.getBoundingClientRect().height || 0

  // calculate the max width using image aspect ratio and container width
  const imageWidthByContainerHeight = imageAspectRatio * containerHeight
  const imageHeightByContainerWidth = imageWidthByContainerHeight / imageAspectRatio
  const paddingTop = 100 / imageAspectRatio + "%"

  useEffect(() => {}, [size.width])

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className="flex h-full w-full items-center" ref={ref}>
      {!imageError && (
        <Tilt
          scale={1.05}
          transitionSpeed={2500}
          tiltMaxAngleX={10}
          tiltMaxAngleY={10}
          tiltReverse={true}
          className={"relative m-auto"}
          style={{ paddingTop, width: `min(100%,${imageWidthByContainerHeight}px)` }}>
          <Image
            src={src}
            alt={alt}
            height={imageHeight}
            width={imageWidth}
            sizes="100vw"
            loading="eager"
            className={cn(
              `absolute inset-0 h-auto w-full overflow-hidden rounded-sm bg-gray-50 object-contain
              shadow-cover-picture transition-all duration-500 will-change-transform`,
              imageLoaded ? "scale-100" : "blur-sm"
            )}
            onLoad={({ target }) => {
              // get the intrinsic dimensions of the image
              const { naturalWidth, naturalHeight } = target as HTMLImageElement
              setImageHeight(naturalHeight)
              setImageWidth(naturalWidth)
              setImageLoaded(true)
            }}
            onError={e => {
              setImageError(true)
            }}
            style={{
              backgroundImage: `url('${lowResSrc}')`,
              backgroundSize: "contain",
              height: `${imageHeightByContainerWidth}`,
              width: `min(100%,${imageWidthByContainerHeight}px)`,
            }}
          />
        </Tilt>
      )}

      {imageError && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex w-full flex-col items-center justify-center">
          <Icon name="question-mark" className="h-[50px] text-foreground opacity-20 lg:h-[100px]" />
          <p className="text-typo-caption opacity-50">Omslag kunne ikke vises</p>
        </motion.div>
      )}
    </div>
  )
}
