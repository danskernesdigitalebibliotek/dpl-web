"use client"

import { useSelector } from "@xstate/react"
import { useRouter } from "next/navigation"
import React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/helpers/helper.cn"
import useSearchMachineActor from "@/lib/machines/search/useSearchMachineActor"

import Icon from "../icon/Icon"

type SearchInputProps = {
  className?: string
  placeholder: string
}

const SearchInput = ({ className, placeholder }: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
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
  }, [currentQuery])

  const handleKeydown = () => (event: KeyboardEvent) => {
    if (!currentQuery) return
    const focusedElement = document.activeElement as HTMLElement

    if (event.key === "Enter" && focusedElement === inputRef.current) {
      navigateToSearch(currentQuery)
    }
  }

  const navigateToSearch = (q: string) => {
    if (!q) return
    actor.send({ type: "SEARCH" })
    router.push(`/search?q=${q}`, {
      scroll: false,
    })
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        className={cn(
          `text-sm focus-visible flex h-[50px] w-full rounded-base bg-background-overlay px-5
          text-typo-subtitle-lg shadow-sm transition-colors placeholder:text-muted-foreground
          disabled:cursor-not-allowed disabled:opacity-50 lg:h-20`,
          className
        )}
        value={currentQuery}
        onChange={({ target: { value } }) => actor.send({ type: "TYPING", q: value })}
        placeholder={placeholder}
      />
      <button
        className="focus-visible absolute right-3 top-[50%] translate-y-[-50%] rounded-full md:right-[24px]"
        onClick={() => currentQuery && navigateToSearch(currentQuery)}
        aria-label="Søg">
        <Icon className="h-[32px] w-[32px]" name="search" />
      </button>
    </div>
  )
}
SearchInput.displayName = "SearchInput"

export default SearchInput
