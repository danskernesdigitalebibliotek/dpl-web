import { useWindowSize } from "@uidotdev/usehooks"
import { motion } from "framer-motion"
import Image from "next/image"
import React, { useEffect, useRef, useState } from "react"
import Tilt from "react-parallax-tilt"

import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

type CoverPictureProps = {
  lowResSrc: string
  src: string
  className?: string
  alt: string
  withTilt?: boolean
}
export const CoverPicture = ({
  src,
  lowResSrc,
  alt,
  withTilt = false,
  className,
}: CoverPictureProps) => {
  const size = useWindowSize()
  const [imageHeight, setImageHeight] = useState(0)
  const [imageWidth, setImageWidth] = useState(0)
  const imageAspectRatio = imageWidth / imageHeight

  // get the container height
  const ref = useRef<HTMLDivElement>(null)
  const containerHeight = ref.current?.getBoundingClientRect().height || 0

  // calculate the max width using image aspect ratio and container width
  const imageWidthByContainerHeight = imageAspectRatio * containerHeight
  const paddingTop = `${100 / imageAspectRatio}%`

  useEffect(() => {}, [size.width])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className={cn("flex h-full w-full items-center", className)} ref={ref}>
      {!imageError && src ? (
        <CoverPictureTiltWrapper
          withTilt={withTilt}
          className={"relative m-auto"}
          style={{ paddingTop, width: `min(100%,${imageWidthByContainerHeight}px)` }}>
          {lowResSrc && (
            <Image
              src={lowResSrc}
              alt={alt}
              height={imageHeight}
              width={imageWidth}
              sizes="20px"
              loading="eager"
              className={cn(
                `absolute inset-0 h-auto w-full overflow-hidden rounded-sm object-contain transition-all duration-500
                  will-change-transform`,
                imageLoaded ? "shadow-none" : "shadow-cover-picture"
              )}
              onLoad={({ target }) => {
                // get the intrinsic dimensions of the image
                const { naturalWidth, naturalHeight } = target as HTMLImageElement
                setImageHeight(naturalHeight)
                setImageWidth(naturalWidth)
              }}
            />
          )}
          {src && (
            <Image
              src={src}
              alt={alt}
              height={imageHeight}
              width={imageWidth}
              sizes="100vw"
              loading="lazy"
              className={cn(
                `absolute inset-0 h-auto w-full overflow-hidden rounded-sm object-contain shadow-cover-picture
                  transition-all duration-500 will-change-transform`,
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => {
                setImageLoaded(true)
              }}
              onError={() => {
                setImageError(true)
              }}
            />
          )}
        </CoverPictureTiltWrapper>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex w-full flex-col items-center justify-center">
          <Icon name="question-mark" className="h-[50px] text-foreground opacity-20 lg:h-[100px]" />
          <p className="text-center text-typo-caption opacity-50">Billede kunne ikke vises</p>
        </motion.div>
      )}
    </div>
  )
}

const CoverPictureTiltWrapper = ({
  children,
  style,
  className,
  withTilt,
}: {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
  withTilt: boolean
}) => {
  return withTilt ? (
    <Tilt
      scale={1.05}
      transitionSpeed={2500}
      tiltMaxAngleX={10}
      tiltMaxAngleY={10}
      tiltReverse={true}
      className={className}
      style={style}>
      {children}
    </Tilt>
  ) : (
    <div className={className} style={style}>
      {children}
    </div>
  )
}
