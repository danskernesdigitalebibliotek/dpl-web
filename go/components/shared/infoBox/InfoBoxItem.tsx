import { useRouter } from "next/navigation"
import React from "react"

import { Button } from "@/components/shared/button/Button"

type InfoBoxItemProps = {
  term: string
  description: string[]
  isButtons?: boolean
}

const InfoBoxItem = ({ term, description, isButtons = false }: InfoBoxItemProps) => {
  const router = useRouter()

  const handleClick = (text: string) => {
    router.push(`/search?q=${text}`, {
      scroll: true,
    })
  }

  return (
    <>
      <hr className="border-border not-first:mt-7" aria-hidden="true" />
      <dt className="mt-2 text-typo-caption">{term}</dt>
      {!isButtons && <dd className="mt-6 text-typo-heading-5">{description.join(", ")}</dd>}
      {isButtons && (
        <dd className="mt-6 flex flex-row flex-wrap gap-2">
          {description.map(item => (
            <Button key={item} size={"sm"} className="px-3" onClick={() => handleClick(item)}>
              {item}
            </Button>
          ))}
        </dd>
      )}
    </>
  )
}

export default InfoBoxItem
