"use client"

import { motion } from "framer-motion"
import React, { useState } from "react"
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
  const { width, height } = covers.large ?? {}

  // Contain-fit in pure CSS: the wrapper takes the image's aspect ratio and
  // a width capped by both the container's width (100cqw) and the width the
  // container's height allows through the ratio (100cqh × ratio) — the same
  // result as an "object-fit: contain" measured in JS, but it tracks layout
  // changes (keen-slider, resize) for free.
  const coverWrapperStyle: React.CSSProperties =
    width && height
      ? {
          aspectRatio: `${width} / ${height}`,
          width: `min(100cqw, calc(100cqh * ${width / height}))`,
          maxWidth: "100%",
          maxHeight: "100%",
        }
      : { width: "100%", height: "100%" }

  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className={cn("[container-type:size] flex h-full w-full items-center", className)}>
      {!imageError && covers.thumbnail ? (
        <CoverPictureTiltWrapper
          key={covers.thumbnail}
          withTilt={withTilt}
          className={"relative mx-auto"}
          style={coverWrapperStyle}>
          {covers.thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={covers.thumbnail}
              alt={alt}
              sizes="20px"
              loading="lazy"
              className={cn(
                `absolute inset-0 h-full w-full overflow-hidden rounded-xs object-contain
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
                `shadow-cover-picture absolute inset-0 h-full w-full overflow-hidden rounded-xs
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
          className="relative flex w-full flex-col items-center justify-center">
          <Icon
            name="question-mark"
            className="text-foreground h-[50px] opacity-20 lg:h-[100px]"
            aria-label="Spørgsmålstegn ikon"
          />
          <p className="text-typo-caption text-center opacity-70">Billede kunne ikke vises</p>
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
      className={cn("bg-background-skeleton h-full w-full animate-pulse rounded-xs", className)}
    />
  )
}
