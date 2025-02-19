import Link from "next/link"
import { env } from "process"
import React from "react"

import { Button } from "@/components/shared/button/Button"
import ImageBaseWithPlaceholder from "@/components/shared/image/ImageBaseWithPlaceholder"
import {
  Image,
  ParagraphGoLink,
  ParagraphGoLinkbox as TParagraphGoLinkbox,
} from "@/lib/graphql/generated/dpl-cms/graphql"
import { cn } from "@/lib/helpers/helper.cn"

type TParagraphGoLinkboxProps = {
  title: TParagraphGoLinkbox["title"]
  goColor?: TParagraphGoLinkbox["goColor"]
  goDescription: TParagraphGoLinkbox["goDescription"]
  goImage: TParagraphGoLinkbox["goImage"] & { mediaImage: Image }
  goLinkParagraph: ParagraphGoLink
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
    goLinkParagraph,
    goColor,
    goImage,
  } = paragraphGoLinkboxProps

  const color = goColor as keyof typeof colorMap
  const linkTitle = goLinkParagraph.link.title
  const linkUrl = `${env.NEXT_PUBLIC_APP_URL}${goLinkParagraph.link.url}`
  const areaLabel = goLinkParagraph.ariaLabel
  const targetBlank = goLinkParagraph.targetBlank

  return (
    <div className="content-container">
      <div className="grid-go gap-y-8">
        <div className="relative col-span-full md:col-span-6 xl:col-span-5 xl:col-start-2">
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
                color ? "m-grid-column-2 lg:m-grid-column" : ""
              )}>
              {goImage?.mediaImage.url && (
                <ImageBaseWithPlaceholder
                  className={cn("rounded-base")}
                  sizes="100vw"
                  imageSizing="fillParent"
                  src={goImage?.mediaImage.url}
                  width={goImage?.mediaImage.width || 0}
                  height={goImage?.mediaImage.height || 0}
                  alt={goImage?.mediaImage.alt || goImage.name}
                />
              )}
            </div>
          </div>
        </div>
        <div className="col-span-full flex items-center lg:col-span-6 xl:col-span-4 xl:col-start-8">
          <div className="lg:ml-grid-column-half xl:-mx-grid-gap space-y-8">
            <h2 className="text-typo-heading-2">{title}</h2>
            <p className="mr-grid-column-half">{description}</p>
            {linkUrl && linkTitle && (
              <Button asChild>
                <Link
                  title={linkTitle}
                  href={linkUrl}
                  area-label={areaLabel || linkTitle}
                  target={targetBlank ? "_blank" : undefined}>
                  {linkTitle}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ParagraphGoLinkbox
