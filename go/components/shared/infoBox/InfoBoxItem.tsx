import { useRouter } from "next/navigation"
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
      <hr className="border-border not-first:mt-7" aria-hidden="true" />
      <dt className="mt-2 text-typo-caption">{term}</dt>
      <dd className={cn("mt-6 text-typo-heading-5", classname)}>{children}</dd>
    </>
  )
}

export default InfoBoxItem
