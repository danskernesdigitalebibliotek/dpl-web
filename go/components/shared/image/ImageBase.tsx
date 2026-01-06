"use client"

import Image from "next/image"
import { useState } from "react"

import { cn } from "@/lib/helpers/helper.cn"

export type TImageBaseProps = {
  imageSizing?: "fillParent" | "intrinsic"
  src: string
  sizes: string
  priority?: boolean
  width: number
  height: number
  alt: string
  base64?: string
  className?: string
}

export default function ImageBase({
  imageSizing = "intrinsic",
  src,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
  className,
  width,
  height,
  alt,
  base64,
}: TImageBaseProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  return (
    <>
      {imageSizing === "fillParent" && (
        <Image
          className={cn(
            `absolute inset-0 h-full w-full object-cover transition-all duration-500
            will-change-transform`,
            imageLoaded ? "" : "blur-sm",
            className
          )}
          priority={priority}
          sizes={sizes}
          src={src}
          width={width}
          height={height}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          style={
            base64
              ? {
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.35)), url('${base64}')`,
                  backgroundSize: "cover",
                  height: "100%",
                  width: "100%",
                  objectPosition: "50% 50%",
                  backgroundPosition: "50% 50%",
                }
              : {}
          }
        />
      )}

      {imageSizing === "intrinsic" && (
        <Image
          className={cn(
            "h-auto w-full object-contain transition-all will-change-transform",
            imageLoaded ? "" : "blur-sm",
            className
          )}
          priority={priority}
          sizes={sizes}
          src={src}
          width={width}
          height={height}
          alt={alt}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
          style={
            base64
              ? {
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.35)), url('${base64}')`,
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "contain",
                  objectPosition: "50% 50%",
                  backgroundPosition: "50% 50%",
                }
              : {}
          }
        />
      )}
    </>
  )
}
