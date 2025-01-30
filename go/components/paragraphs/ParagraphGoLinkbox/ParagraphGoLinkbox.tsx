import Link from "next/link"
import React from "react"

import { Button } from "@/components/shared/button/Button"
import { ParagraphGoLinkbox as TParagraphGoLinkbox } from "@/lib/graphql/generated/dpl-cms/graphql"
import { cn } from "@/lib/helpers/helper.cn"

type TParagraphGoLinkboxProps = {
  title: TParagraphGoLinkbox["title"]
  goColor?: TParagraphGoLinkbox["goColor"]
  goDescription: TParagraphGoLinkbox["goDescription"]
  goImage?: TParagraphGoLinkbox["goImage"]
  goLink: TParagraphGoLinkbox["goLink"]
}

const colorMap = {
  "#bee6fa": "bg-content-purple-100", // replace with actual color name from cms
  blue: "bg-content-blue-100",
  green: "bg-content-green-100",
  yellow: "bg-content-yellow-100",
}

function ParagraphGoLinkbox(paragraphGoLinkboxProps: TParagraphGoLinkboxProps) {
  const {
    title,
    goDescription: description,
    goLink: link,
    goColor,
    goImage: image,
  } = paragraphGoLinkboxProps

  const color = goColor?.color?.toLowerCase() as keyof typeof colorMap

  return (
    <div className="content-container">
      <div className="grid-go">
        <div className="col-span-5 col-start-2">
          <div className={cn("aspect-1/1 rounded-md", color ? colorMap[color] : "")}></div>
          {/* <img src={image?.url} alt={image?.alt} /> */}
        </div>
        <div className="col-span-4 col-start-8 -mx-grid-gap flex items-center">
          <div className="space-y-8">
            <h2 className="text-typo-heading-1">{title}</h2>
            <p>{description}</p>
            {link?.url && (
              <Button asChild>
                <Link href={link?.url}>{link?.title}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <pre>{JSON.stringify(paragraphGoLinkboxProps, null, 2)}</pre>
    </div>
  )
}

export default ParagraphGoLinkbox
