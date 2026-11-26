import type { PeriodicalByIssnQuery } from "../../../fbi/generated/graphql"
import type { Manifestation } from "../../../fbi/types"
import type { TraceRow } from "../../trace"

export const periodicalRules = {
  lookup:
    "Tidsskriftet findes med en CQL-søgning på hostPublication.issn blandt aviser og tidsskrifter; kun præcis ét værk tæller",
  publishedIn: "Udgivet i linker til tidsskriftets værk, når det findes",
  printedIssue: "Find det trykte nummer fører til tidsskriftets værk, når det findes; ellers til en søgning på tidsskriftets titel",
}

export const getPeriodicalCql = (issn: string) =>
  `term.issn="${issn}" AND phrase.generalmaterialtype="aviser og tidsskrifter"`

type PeriodicalLinkInput = {
  manifestation: Manifestation
  search: PeriodicalByIssnQuery["complexSearch"] | undefined
  isSearching: boolean
  profile: string
}

const describeLookup = (issn: string | undefined, { search, isSearching, profile }: PeriodicalLinkInput) => {
  if (!issn) return { periodicalWorkId: undefined, input: "hostPublication.issn mangler", outcome: "Ingen søgning" }
  const input = `FBI-profil ${profile}: complexSearch(cql: ${getPeriodicalCql(issn)})`
  if (isSearching) return { periodicalWorkId: undefined, input, outcome: "Søger…" }
  const [onlyWork] = search?.works ?? []
  if (search?.hitcount === 1 && onlyWork) {
    return { periodicalWorkId: onlyWork.workId, input, outcome: `Ét værk → ${onlyWork.workId}` }
  }
  return { periodicalWorkId: undefined, input, outcome: `${search?.hitcount ?? 0} værker → ikke fundet` }
}

/**
 * The article's periodical, when the ISSN search finds it, and the links that
 * follow: "Udgivet i" and "Find det trykte nummer".
 */
export const resolvePeriodicalLink = (input: PeriodicalLinkInput) => {
  const host = input.manifestation.hostPublication
  if (!host) return { publishedInTo: undefined, printedIssueTo: undefined, rows: [] }

  const { periodicalWorkId, input: lookupInput, outcome } = describeLookup(host.issn ?? undefined, input)
  const publishedInTo = periodicalWorkId && `/work/${periodicalWorkId}`
  const printedIssueTo = publishedInTo ?? `/?q=${encodeURIComponent(host.title)}`
  const rows: TraceRow[] = [
    { rule: periodicalRules.lookup, input: lookupInput, outcome },
    {
      rule: periodicalRules.publishedIn,
      input: `hostPublication.summary = ${host.summary}`,
      outcome: publishedInTo ? `Link → ${publishedInTo}` : "Intet link",
    },
    {
      rule: periodicalRules.printedIssue,
      input: `hostPublication.title = ${host.title}`,
      outcome: publishedInTo ? `→ ${publishedInTo}` : "→ søgning på titel",
    },
  ]
  return { publishedInTo, printedIssueTo, rows }
}
