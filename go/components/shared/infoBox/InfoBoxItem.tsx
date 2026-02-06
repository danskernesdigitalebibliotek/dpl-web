import React, { ReactNode } from "react"

import { cn } from "@/lib/helpers/helper.cn"

type InfoBoxItemProps = {
  term: string
  children?: ReactNode
  classname?: string
}

const InfoBoxItem = ({ term, children, classname }: InfoBoxItemProps) => {
  return (
    <>
      <hr className="not-first:mt-7" aria-hidden="true" />
      <dt className="text-typo-caption mt-2">{term}</dt>
      <dd className={cn("text-typo-heading-5 mt-6", classname)}>{children}</dd>
    </>
  )
}

export default InfoBoxItem
