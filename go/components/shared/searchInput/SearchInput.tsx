"use client"

import { useSelector } from "@xstate/react"
import { useRouter } from "next/navigation"
import React, { useEffect, useRef } from "react"

import { cyKeys } from "@/cypress/support/constants"
import { cn } from "@/lib/helpers/helper.cn"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

import Icon from "../icon/Icon"

type SearchInputProps = {
  className?: string
  placeholder: string
}

const SearchInput = ({ className, placeholder }: SearchInputProps) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const actor = useSearchMachineActor()
  const currentQuery = useSelector(actor, snapshot => {
    return snapshot.context.currentQuery
  })

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown())
    return () => {
      window.removeEventListener("keydown", handleKeydown())
    }
    // We choose to ignore the eslint warning below
    // because we do not want to add the handleKeydown callback which changes on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleKeydown = () => (event: KeyboardEvent) => {
    const focusedElement = document.activeElement as HTMLElement

    if (event.key === "Enter" && focusedElement === inputRef.current) {
      searchAndNavigate(inputRef.current.value)
    }
  }

  const searchAndNavigate = (query: string) => {
    const url = resolveUrl({
      routeParams: { search: "search" },
      queryParams: { q: query },
    })

    router.push(url)
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        className={cn(
          `focus-visible rounded-base bg-background-overlay text-typo-subtitle-lg
          placeholder:text-muted-foreground flex h-[50px] w-full px-5 transition-colors
          disabled:cursor-not-allowed disabled:opacity-50 lg:h-20`,
          className
        )}
        value={currentQuery}
        onChange={({ target: { value } }) => actor.send({ type: "TYPING", q: value })}
        placeholder={placeholder}
        data-cy={cyKeys["search-input"]}
      />
      <button
        className="focus-visible absolute top-[50%] right-3 translate-y-[-50%] rounded-full
          md:right-[24px]"
        onClick={() => searchAndNavigate(currentQuery)}
        aria-label="Søg">
        <Icon className="h-[32px] w-[32px]" name="search" />
      </button>
    </div>
  )
}
SearchInput.displayName = "SearchInput"

export default SearchInput
