import React from "react"

import goConfig from "@/lib/config/goConfig"

import ImageBase, { TImageBaseProps } from "./ImageBase"

type TImageWrapperProps = Omit<TImageBaseProps, "base64">

export default async function ImageBaseWithPlaceholder(props: TImageWrapperProps) {
  const { src, ...otherProps } = props

  if (!src) return null

  // Get base64 image
  const response = await fetch(
    `${goConfig("app.url")}/api/getBase64?url=${encodeURIComponent(src)}`
  )
  const { data } = await response.json()
  const base64 = data?.base64

  if (!base64) {
    return <div>Image not found</div>
  }

  return <ImageBase src={src} base64={base64} {...otherProps} />
}
