import { motion } from "framer-motion"
import Image from "next/image"
import React, { useState } from "react"
import Tilt from "react-parallax-tilt"

import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

type CoverPictureProps = {
  lowResSrc: string
  src: string
  classNames?: string
  alt: string
  withTilt?: boolean
}
export const CoverPicture = ({
  src,
  lowResSrc,
  alt,
  withTilt = false,
  classNames,
}: CoverPictureProps) => {
  const [imageHeight, setImageHeight] = useState(0)
  const [imageWidth, setImageWidth] = useState(0)
  const imageAspectRatio = imageWidth / imageHeight
  const paddingTop = `${100 / imageAspectRatio}%`
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div className={cn("flex h-full w-full items-center", classNames)}>
      {!imageError && src ? (
        <Tilt
          scale={withTilt ? 1.05 : 1}
          transitionSpeed={2500}
          tiltMaxAngleX={withTilt ? 10 : 0}
          tiltMaxAngleY={withTilt ? 10 : 0}
          tiltReverse={true}
          className={"relative w-full"}
          style={{ paddingTop, width: "100%" }}>
          {lowResSrc && (
            <Image
              src={lowResSrc}
              alt={alt}
              height={0}
              width={0}
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
              height={0}
              width={0}
              sizes="100vw"
              loading="lazy"
              className={cn(
                `absolute inset-0 h-auto w-full overflow-hidden rounded-sm object-contain shadow-cover-picture
                  transition-all duration-500 will-change-transform`,
                imageLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={({ target }) => {
                // get the intrinsic dimensions of the image
                const { naturalWidth, naturalHeight } = target as HTMLImageElement
                setImageHeight(naturalHeight)
                setImageWidth(naturalWidth)
                setImageLoaded(true)
              }}
              onError={() => {
                setImageError(true)
              }}
            />
          )}
        </Tilt>
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
