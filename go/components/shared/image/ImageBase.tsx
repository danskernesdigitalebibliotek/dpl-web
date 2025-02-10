"use client"

import Image from "next/image"
import { ComponentProps, useEffect, useState } from "react"

import { cn } from "@/lib/helpers/helper.cn"

export type TImageBaseProps = {
  imageSizing?: "fillParent" | "intrinsic"
  src: string
  sizes: string
  priority?: boolean
  width: number
  height: number
  alt: string
  base64: string
  className: string
}

export default async function ImageBase({
  imageSizing = "intrinsic",
  src,
  sizes = "100vw",
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
            `absolute inset-0 h-full w-full bg-gray-50 object-cover transition-all duration-500
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
          style={{
            backgroundImage: `url('${base64}')`,
            backgroundSize: "cover",
            height: "100%",
            width: "100%",
          }}
        />
      )}

      {imageSizing === "intrinsic" && (
        <Image
          className={cn(
            "h-auto w-full bg-gray-50 object-contain transition-all will-change-transform",
            className
          )}
          priority={priority}
          sizes={sizes}
          src={src}
          width={width}
          height={height}
          alt={alt}
        />
      )}
    </>
  )
}
