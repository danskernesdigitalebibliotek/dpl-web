import React from "react"

import ImageBase, { TImageBaseProps } from "@/components/shared/image/ImageBase"

// Storybook stand-in for the real ImageBaseWithPlaceholder, which is an
// async server component (it fetches a base64 blur placeholder) and cannot
// render in the client-only Storybook environment. Aliased in main.ts;
// renders the image without the blur-up placeholder.
export default function ImageBaseWithPlaceholder(props: Omit<TImageBaseProps, "base64">) {
  if (!props.src) return null
  return <ImageBase {...props} />
}
