import { useRouter } from "next/navigation"
import React from "react"

import { Button } from "@/components/shared/button/Button"

type isButtonsType = {
  isButtons?: true
  isSearchable?: false
}

type isSearchableType = {
  isSearchable?: true
  isButtons?: false
}

type InfoBoxItemProps = {
  term: string
  description: string[]
} & (isButtonsType | isSearchableType)

const InfoBoxItem = ({
  term,
  description,
  isButtons = false,
  isSearchable = false,
}: InfoBoxItemProps) => {
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
      {!description.length && <dd className="mt-6 text-typo-heading-5">-</dd>}
      {!!description.length && !isButtons && !isSearchable && (
        <dd className="mt-6 text-typo-heading-5">{description.join(", ")}</dd>
      )}
      {!!description.length && isButtons && (
        <dd className="mt-6 flex flex-row flex-wrap gap-2">
          {description.map(item => (
            <Button key={item} size={"sm"} className="px-3" onClick={() => handleClick(item)}>
              {item}
            </Button>
          ))}
        </dd>
      )}
      {isSearchable && (
        <dd className="mt-6 text-typo-heading-5">
          {description.map(item => (
            <span key={item}>
              {/* "Del xyz i " is not a link to search */}
              <span>{item.match(/^Del \d+ i /)?.[0]}</span>
              {/* Name of the series links to a search. */}
              <span
                onClick={() => handleClick(item.replace(/^Del \d+ i /, ""))}
                className="animate-text-underline">
                {item.replace(/^Del \d+ i /, "")}
              </span>
            </span>
          ))}
        </dd>
      )}
    </>
  )
}

export default InfoBoxItem
