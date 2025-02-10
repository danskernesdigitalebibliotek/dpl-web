import { useQuery } from "@tanstack/react-query"
import { getPlaiceholder } from "plaiceholder"
import React, { Suspense } from "react"

import ImageBase, { TImageBaseProps } from "./ImageBase"

type TImageWrapperProps = TImageBaseProps

export default async function ImageWrapper(props: TImageWrapperProps) {
  const { src, ...otherProps } = props

  if (!src) return null

  const buffer = await fetch(src.toString()).then(async res => Buffer.from(await res.arrayBuffer()))
  const { base64 } = await getPlaiceholder(buffer, { size: 50 })

  if (!base64) {
    return <div>Image not found</div>
  }

  return <ImageBase src={src} blurDataURL={base64} {...otherProps} />
}
