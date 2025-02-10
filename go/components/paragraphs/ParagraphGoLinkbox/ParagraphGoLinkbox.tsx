
import 'server-only'

import Link from "next/link"
import { getPlaiceholder } from "plaiceholder"
import React, { Suspense } from "react"

import { Button } from "@/components/shared/button/Button"
import ImageBase from "@/components/shared/image/ImageBase"
import ImageWrapper from "@/components/shared/image/ImageWrapper"
import {
  MediaImage,
  ParagraphGoLink,
  ParagraphUnion,
  ParagraphGoLinkbox as TParagraphGoLinkbox,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { cn } from "@/lib/helpers/helper.cn"

type TParagraphGoLinkboxProps = {
  title: TParagraphGoLinkbox["title"]
  goColor?: TParagraphGoLinkbox["goColor"]
  goDescription: TParagraphGoLinkbox["goDescription"]
  goImage: MediaImage & { alt?: string; height?: number; width?: number }
  goLink?: ParagraphGoLink
}

const colorMap = {
  content_color_1: "bg-content-1",
  content_color_2: "bg-content-2",
  content_color_3: "bg-content-3",
  content_color_4: "bg-content-4",
}

async function ParagraphGoLinkbox(paragraphGoLinkboxProps: TParagraphGoLinkboxProps) {
  const {
    title,
    goDescription: description,
    goLink: link,
    goColor,
    goImage,
  } = paragraphGoLinkboxProps

  const color = goColor as keyof typeof colorMap
  const linkTitle = link?.link[0].title
  const linkUrl = link?.link[0].url

  const buffer = await fetch(goImage?.mediaImage.url.toString()).then(async res =>
    Buffer.from(await res.arrayBuffer())
  )
  const { base64 } = await getPlaiceholder(buffer, { size: 50 })

  return (
    <div className="content-container">
      <div className="grid-go">
        <div className="relative col-span-5 col-start-2">
          <div className="relative aspect-1/1 overflow-hidden rounded-md">
            {goColor && (
              <div
                className={cn(
                  "absolute inset-0 h-full w-full",
                  color ? colorMap[color] : ""
                )}></div>
            )}
            <div
              className={cn(
                "relative aspect-1/1 overflow-hidden rounded-md",
                color ? "m-grid-column" : ""
              )}>
              {base64 && goImage.mediaImage.url && (
                <ImageBase
                  className={cn("rounded-base")}
                  sizes="100vw"
                  base64={base64}
                  imageSizing="fillParent"
                  src={goImage?.mediaImage.url}
                  width={goImage?.mediaImage.width || 0}
                  height={goImage?.mediaImage.height || 0}
                  alt={goImage?.alt || ""}
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-span-4 col-start-8 flex items-center">
          <div className="-mx-grid-gap space-y-8">
            <h2 className="text-typo-heading-1">{title}</h2>
            <p className="mr-grid-column-half">{description}</p>
            {linkUrl && linkTitle && (
              <Button asChild>
                <Link href={linkUrl}>{linkTitle}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* <pre>{JSON.stringify(paragraphGoLinkboxProps, null, 2)}</pre> */}
    </div>
  )
}

export default ParagraphGoLinkbox
