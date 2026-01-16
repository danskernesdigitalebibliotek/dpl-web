"use client"

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
  const imageAspectRatio = (covers.large?.width ?? 0) / (covers.large?.height ?? 0)

  const ref = useRef<HTMLDivElement>(null)

  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null)

  // Keep container size in sync with layout changes using ResizeObserver so we also react
  // when Keen slider changes slide width (without requiring a window resize).
  useEffect(() => {
    if (!ref.current) return

    const el = ref.current
    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (!entry) return

      const { width, height } = entry.contentRect
      if (!width || !height) return

      setContainerSize(prev => {
        if (prev && prev.width === width && prev.height === height) return prev
        return { width, height }
      })
    })

    observer.observe(el)

    return () => {
      observer.disconnect()
    }
  }, [])

  const containerHeight = containerSize?.height ?? 0
  const containerWidth = containerSize?.width ?? 0

  // Fallback to image aspect ratio if we don't yet know the container size to avoid NaN calculations
  const hasContainerSize = containerHeight > 0 && containerWidth > 0 && imageAspectRatio > 0

  // Calculate a width/height that fits INSIDE the container ("object-fit: contain" behavior)
  let coverWidth = 0
  let coverHeight = 0

  if (hasContainerSize) {
    // Start by filling the container width
    coverWidth = containerWidth
    coverHeight = coverWidth / imageAspectRatio

    // If the result becomes taller than the container, constrain by height instead
    if (coverHeight > containerHeight) {
      coverHeight = containerHeight
      coverWidth = coverHeight * imageAspectRatio
    }
  }

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Use a style that either matches the calculated size or falls back to 100%
  const coverWrapperStyle: React.CSSProperties = hasContainerSize
    ? { width: `${coverWidth}px`, height: `${coverHeight}px` }
    : { width: "100%", height: "100%" }

  return (
    <div className={cn("flex h-full w-full items-center", className)} ref={ref}>
      {!imageError && covers.thumbnail ? (
        <CoverPictureTiltWrapper
          key={covers.thumbnail}
          withTilt={withTilt}
          className={"relative m-auto"}
          style={coverWrapperStyle}>
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
            aria-label="Question mark icon"
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
