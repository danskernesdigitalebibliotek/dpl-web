import type { PeriodicalByIssnQuery } from "../../../fbi/generated/graphql"
import type { TraceRow } from "../../trace"

export const periodicalRules = {
  lookup:
    "Find det trykte nummer fører til tidsskriftets værk, når en CQL-søgning på hostPublication.issn blandt aviser og tidsskrifter giver præcis ét værk; ellers til en søgning på tidsskriftets titel",
}

export const getPeriodicalCql = (issn: string) =>
  `term.issn="${issn}" AND phrase.generalmaterialtype="aviser og tidsskrifter"`

type PeriodicalLinkInput = {
  hostTitle: string
  issn: string | undefined
  search: PeriodicalByIssnQuery["complexSearch"] | undefined
  isSearching: boolean
  profile: string
}

const toTitleSearch = (hostTitle: string) => `/?q=${encodeURIComponent(hostTitle)}`

const describeSearch = ({ hostTitle, search, isSearching }: PeriodicalLinkInput) => {
  if (isSearching) return { to: toTitleSearch(hostTitle), outcome: "Søger… → søgning på titel indtil videre" }
  const [onlyWork] = search?.works ?? []
  if (search?.hitcount === 1 && onlyWork) return { to: `/work/${onlyWork.workId}`, outcome: `Ét værk → ${onlyWork.workId}` }
  return { to: toTitleSearch(hostTitle), outcome: `${search?.hitcount ?? 0} værker → søgning på titel` }
}

/** Where "Find det trykte nummer" leads, and why. */
export const resolvePeriodicalLink = (input: PeriodicalLinkInput): { to: string; rows: TraceRow[] } => {
  if (!input.issn) {
    return {
      to: toTitleSearch(input.hostTitle),
      rows: [{ rule: periodicalRules.lookup, input: "hostPublication.issn mangler", outcome: "Søgning på titel" }],
    }
  }
  const { to, outcome } = describeSearch(input)
  return {
    to,
    rows: [
      {
        rule: periodicalRules.lookup,
        input: `FBI-profil ${input.profile}: complexSearch(cql: ${getPeriodicalCql(input.issn)})`,
        outcome,
      },
    ],
  }
}
