import type { ArticleSuggestQuery } from "../fbi/generated/graphql"

type Suggestion = ArticleSuggestQuery["suggest"]["result"][number]

export type SuggestionOption =
  | { kind: "text"; id: string; label: string; to: string }
  | { kind: "work"; id: string; title: string; creators: string; host: string | undefined; to: string }

const maximumTextOptions = 7
const maximumWorkOptions = 3

// As the library sites label them.
const typeLabels: Record<Suggestion["type"], string> = {
  CREATOR: "Forfatter",
  SUBJECT: "Emne",
  TITLE: "Titel",
  COMPOSIT: "Titel",
}

export const toSearchPath = (query: string) => `/?q=${encodeURIComponent(query)}`

/**
 * FBI's suggestions as the header's two groups, as on the library sites: terms
 * to search for, then up to three articles to open.
 */
export const toSuggestionOptions = (suggestions: Suggestion[]): SuggestionOption[] => {
  const textOptions = suggestions.slice(0, maximumTextOptions).map(
    (suggestion, index): SuggestionOption => ({
      kind: "text",
      id: `text-${index}`,
      label: `${suggestion.term} (${typeLabels[suggestion.type]})`,
      to: toSearchPath(suggestion.term),
    })
  )

  const works = suggestions.flatMap((suggestion) => (suggestion.work ? [suggestion.work] : []))
  const uniqueWorks = works.filter(
    (work, index) => works.findIndex((candidate) => candidate.workId === work.workId) === index
  )
  const workOptions = uniqueWorks.slice(0, maximumWorkOptions).map(
    (work): SuggestionOption => ({
      kind: "work",
      id: `work-${work.workId}`,
      title: work.titles.main.join(" "),
      creators: work.creators.map((creator) => creator.display).join(", "),
      host: work.manifestations.bestRepresentation.hostPublication?.title,
      to: `/work/${encodeURIComponent(work.workId)}`,
    })
  )

  return [...textOptions, ...workOptions]
}
