import { useWindowSize } from "@uidotdev/usehooks"
import { motion } from "framer-motion"
import React, { useEffect, useRef, useState } from "react"
import Tilt from "react-parallax-tilt"

import Icon from "@/components/shared/icon/Icon"
import { Cover } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

type CoverPictureProps = {
  covers: Cover
  className?: string
  alt: string
  withTilt?: boolean
}
export const CoverPicture = ({ covers, alt, withTilt = false, className }: CoverPictureProps) => {
  const size = useWindowSize()
  const imageAspectRatio = (covers.large?.width ?? 0) / (covers.large?.height ?? 0)

  // get the container height
  const ref = useRef<HTMLDivElement>(null)
  const containerHeight = ref.current?.getBoundingClientRect().height || 0
  const containerWidth = ref.current?.getBoundingClientRect().width || 0

  // calculate container aspect ratio
  const containerAspectRatio = containerWidth / containerHeight

  // calculate the max width using image aspect ratio and container width
  const imageWidthByContainerHeight = imageAspectRatio * containerHeight
  const imageHeightByContainerWidth = containerWidth / imageAspectRatio

  useEffect(() => {}, [size.width])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // adjust the padding top based on the image aspect ratio and the container width
  const paddingTop =
    containerHeight > imageHeightByContainerWidth
      ? `${100 / imageAspectRatio}%`
      : `${100 / containerAspectRatio}%`

  return (
    <div className={cn("flex h-full w-full items-center", className)} ref={ref}>
      {!imageError && covers.thumbnail ? (
        <CoverPictureTiltWrapper
          withTilt={withTilt}
          className={"relative m-auto"}
          style={{ paddingTop, width: `${imageWidthByContainerHeight}px` }}>
          {covers.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={covers.thumbnail}
              alt={alt}
              sizes="20px"
              loading="lazy"
              className={cn(
                `absolute inset-0 h-auto w-full overflow-hidden rounded-sm object-contain
                  transition-all duration-500 will-change-transform`,
                imageLoaded ? "shadow-none" : "shadow-cover-picture"
              )}
            />
          )}
          {covers.large && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              srcSet={`${covers.xSmall?.url} 120w, ${covers.small?.url} 240w, ${covers.medium?.url} 480w, ${covers.large?.url} 960w`}
              sizes="(max-width: 500px) 110px, (max-width: 1024px) 230px, 320px"
              alt={alt}
              loading="lazy"
              className={cn(
                `shadow-cover-picture absolute inset-0 h-auto w-full overflow-hidden rounded-sm
                  object-contain transition-all duration-500 will-change-transform`,
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
          <Icon
            name="question-mark"
            className="text-foreground h-[50px] opacity-20 lg:h-[100px]"
            aria-label="Spørgsmålstegn ikon"
          />
          <p className="text-typo-caption text-center opacity-55">Billede kunne ikke vises</p>
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

export const CoverPictureSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn("bg-background-skeleton h-full w-full animate-pulse rounded-md", className)}
    />
  )
}
