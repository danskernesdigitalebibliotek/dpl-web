import { type FormEvent, type KeyboardEvent, useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { useLocation, useNavigate } from "react-router"

import { minimumSuggestLength, useArticleSuggest } from "../fbi/useArticleSuggest"
import { type SuggestionOption, toSearchPath, toSuggestionOptions } from "./suggestions"

const debounceMilliseconds = 250

const useDebouncedValue = (value: string) => {
  const [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), debounceMilliseconds)
    return () => window.clearTimeout(timeout)
  }, [value])
  return debouncedValue
}

const highlightClasses = (isHighlighted: boolean) =>
  `cursor-pointer md:hover:bg-surface-alt ${isHighlighted ? "bg-surface-alt" : ""}`

/**
 * The header's search among articles, with suggestions as on the library
 * sites (react/'s search-header): terms first, then up to three articles,
 * over a dimmed page that closes them when clicked.
 */
export const ArticleSearch = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const listboxId = useId()
  const [query, setQuery] = useState(() => new URLSearchParams(location.search).get("q") ?? "")
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const debouncedQuery = useDebouncedValue(query.trim())
  const { data, error } = useArticleSuggest(debouncedQuery)

  const hasQuery = debouncedQuery.length >= minimumSuggestLength
  const options = hasQuery && data ? toSuggestionOptions(data.suggest.result) : []
  const textOptions = options.filter((option) => option.kind === "text")
  const workOptions = options.filter((option) => option.kind === "work")
  const errorText = hasQuery && error ? `Forslag kunne ikke hentes: ${error.message}` : undefined
  const isExpanded = isOpen && (options.length > 0 || Boolean(errorText))

  // A new page closes the suggestions; the search page shows its query in the field.
  useEffect(() => {
    setIsOpen(false)
    if (location.pathname === "/") setQuery(new URLSearchParams(location.search).get("q") ?? "")
  }, [location.pathname, location.search])

  const close = () => {
    setIsOpen(false)
    setHighlightedIndex(-1)
  }

  const go = (to: string) => {
    close()
    navigate(to)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const highlighted = isExpanded ? options[highlightedIndex] : undefined
    if (highlighted) return go(highlighted.to)
    if (query.trim()) go(toSearchPath(query.trim()))
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") return close()
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    event.preventDefault()
    setIsOpen(true)
    const step = event.key === "ArrowDown" ? 1 : -1
    // Cycles through the options and back to the field (-1).
    setHighlightedIndex((index) => {
      const next = index + step
      if (next >= options.length) return -1
      if (next < -1) return options.length - 1
      return next
    })
  }

  const optionProps = (option: SuggestionOption) => {
    const index = options.indexOf(option)
    return {
      id: `${listboxId}-${option.id}`,
      role: "option",
      "aria-selected": index === highlightedIndex,
      // Keeps focus in the field, so the click lands before anything closes.
      onMouseDown: (event: { preventDefault: () => void }) => event.preventDefault(),
      onClick: () => go(option.to),
      onMouseEnter: () => setHighlightedIndex(index),
    }
  }

  const highlighted = isExpanded ? options[highlightedIndex] : undefined

  return (
    <form role="search" onSubmit={handleSubmit} className="relative flex h-full w-full items-center">
      {isExpanded &&
        createPortal(
          <div aria-hidden="true" onClick={close} className="fixed inset-0 z-30 bg-black/50" />,
          document.body
        )}
      <label htmlFor={`${listboxId}-input`} className="sr-only">
        Søg blandt artikler
      </label>
      <input
        id={`${listboxId}-input`}
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isExpanded}
        aria-controls={listboxId}
        aria-activedescendant={highlighted ? `${listboxId}-${highlighted.id}` : undefined}
        autoComplete="off"
        placeholder="Søg blandt artikler"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value)
          setIsOpen(true)
          setHighlightedIndex(-1)
        }}
        onClick={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        className={`box-border h-full w-full border-0 pr-14 pl-6 font-body text-body-m text-text-heading outline-none placeholder:text-text-body focus:bg-white ${
          isExpanded ? "bg-white" : "bg-transparent"
        }`}
      />
      <button
        type="submit"
        aria-label="Søg"
        className="absolute right-4 flex size-10 cursor-pointer items-center justify-center border-0 bg-transparent p-0 text-text-heading"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" strokeLinecap="round" />
        </svg>
      </button>

      {isExpanded && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label="Forslag"
          className="absolute top-full right-0 left-0 m-0 list-none border border-t-0 border-solid border-outline bg-surface-page py-4 pl-0 shadow-[0_23px_23px_rgba(0,0,0,0.2)]"
        >
          {errorText && <li className="px-6 py-2 text-body-m text-text-body">{errorText}</li>}
          {textOptions.map((option) => (
            <li
              key={option.id}
              {...optionProps(option)}
              className={`box-border flex min-h-10 items-center px-6 text-body-m text-text-body ${highlightClasses(options.indexOf(option) === highlightedIndex)}`}
            >
              <span className="truncate">{option.kind === "text" && option.label}</span>
            </li>
          ))}
          {workOptions.length > 0 && (
            <li role="presentation" className={textOptions.length ? "mt-4 border-t border-b border-outline py-2" : ""}>
              <ul role="group" aria-label="Artikler" className="m-0 list-none p-0 md:flex">
                {workOptions.map(
                  (option) =>
                    option.kind === "work" && (
                      <li
                        key={option.id}
                        {...optionProps(option)}
                        className={`box-border flex items-center gap-[15px] px-4 py-4 md:w-1/3 ${highlightClasses(options.indexOf(option) === highlightedIndex)}`}
                      >
                        <span aria-hidden="true" className="h-[104px] w-[72px] shrink-0 bg-[#375a8f] shadow-sm" />
                        <span className="flex min-w-0 flex-col text-text-body">
                          <span className="line-clamp-2 text-body-m font-medium">{option.title}</span>
                          {option.creators && <span className="truncate text-body-s">{option.creators}</span>}
                          {option.host && <span className="truncate text-caption text-text-inactive">I: {option.host}</span>}
                        </span>
                      </li>
                    )
                )}
              </ul>
            </li>
          )}
        </ul>
      )}
    </form>
  )
}
