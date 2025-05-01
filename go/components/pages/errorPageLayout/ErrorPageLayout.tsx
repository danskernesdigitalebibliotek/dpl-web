import Link from "next/link"
import React from "react"

import { Button } from "@/components/shared/button/Button"

const ErrorPageLayout = ({
  title,
  description,
  buttonText,
  buttonLink,
}: {
  title: string
  description: string
  buttonText: string
  buttonLink: string
}) => {
  return (
    <div className="content-container grid-go w-full">
      <div className="flex-column lg:space-y-grid-gap-1 my-grid-gap-2 space-y-grid-gap-2 lg:my-grid-gap-half col-span-10">
        <h2 className="text-typo-huge">{title}</h2>
        <p className="text-typo-body-lg max-w-prose">{description}</p>
        <Button ariaLabel={buttonText} asChild size={"lg"}>
          <Link href={buttonLink} className="text-typo-body-lg">
            {buttonText}
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default ErrorPageLayout
