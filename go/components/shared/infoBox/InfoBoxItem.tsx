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
      <hr className="border-foreground opacity-15 not-first:mt-7" />
      <dt className="mt-2 text-typo-caption">{term}</dt>
      {!isButtons && <dd className="mt-6 text-typo-heading-5">{description.join(", ")}</dd>}
      {isButtons && (
        <div className="mt-6 flex flex-row flex-wrap gap-2">
          {description.map(desc => (
            <Button key={desc} size={"sm"} className="px-3" onClick={() => handleClick(desc)}>
              {desc}
            </Button>
          ))}
        </div>
      )}
    </>
  )
}

export default InfoBoxItem
