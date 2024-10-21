"use client"

import { useRouter, useSearchParams } from "next/navigation"
import React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

import Icon from "../icon/Icon"

type SearchInputProps = {
  className?: string
  placeholder: string
}

const SearchInput = ({ className, placeholder }: SearchInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const searchParams = useSearchParams()
  const [queryString, setQueryString] = React.useState("")

  useEffect(() => {
    setQueryString(searchParams.get("q") || "")
    window.addEventListener("keydown", handleKeydown)
    return () => {
      window.removeEventListener("keydown", handleKeydown)
    }
  }, [])

  const handleKeydown = (event: KeyboardEvent) => {
    if (!inputRef.current) return
    const focusedElement = document.activeElement as HTMLElement

    if (event.key === "Enter" && focusedElement === inputRef.current) {
      navigateToSearch()
    }
  }

  const navigateToSearch = () => {
    if (!inputRef.current) return
    const inputValue = inputRef.current.value
    router.push(inputValue ? `/search?q=${inputValue}` : "/search", {
      scroll: false,
    })
  }

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        className={cn(
          `text-sm file:text-sm flex h-[50px] w-full rounded-base bg-background-overlay px-5
          text-typo-subtitle-lg shadow-sm transition-colors file:border-0 file:bg-transparent file:font-medium
          file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none
          focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 lg:h-20`,
          className
        )}
        value={queryString}
        onChange={e => setQueryString(e.target.value)}
        placeholder={placeholder}
      />
      <button
        className="absolute right-[24px] top-[50%] translate-y-[-50%]"
        onClick={navigateToSearch}>
        <Icon className="h-[32px] w-[32px]" name="search" />
      </button>
    </div>
  )
}
SearchInput.displayName = "SearchInput"

export default SearchInput
