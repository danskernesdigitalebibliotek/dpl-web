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
  description: React.ReactNode
  buttonText?: string
  buttonLink?: string
}) => {
  return (
    <div className="content-container grid-go w-full">
      <div
        className="flex-column lg:space-y-grid-gap-1 my-grid-gap-2 space-y-grid-gap-2
          lg:my-grid-gap-half col-span-6">
        <h2 className="text-typo-heading-1">{title}</h2>
        <div className="wysiwyg">{description}</div>
        {buttonLink && buttonText && (
          <Button ariaLabel={buttonText} asChild size={"lg"}>
            <Link href={buttonLink} className="text-typo-body-lg">
              {buttonText}
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

export default ErrorPageLayout
