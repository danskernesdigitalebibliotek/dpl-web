import type { Manifestation } from "../../../fbi/types"
import type { TraceRow } from "../../trace"

/**
 * One way to get to an article. Ranked as the ticket orders them: read it in
 * Retriever, see it online, order a digital copy, find the printed issue.
 */
export type AccessWay =
  | { kind: "read-article"; retrieverId: string }
  | { kind: "online"; url: string }
  | { kind: "digital-copy" }
  | { kind: "printed-issue"; hostTitle: string }

type Access = Manifestation["access"][number]

export const accessWayRank: AccessWay["kind"][] = ["read-article", "online", "digital-copy", "printed-issue"]

export const accessWayLabels: Record<AccessWay["kind"], string> = {
  "read-article": "Læs artikel",
  online: "Se online",
  "digital-copy": "Bestil digital kopi",
  "printed-issue": "Find det trykte nummer",
}

/** The access rules in words, shared by the trace rows and the debug panel's rule list. */
export const accessRules = {
  ranking: `Adgangsveje prioriteres: ${accessWayRank.map((kind) => accessWayLabels[kind]).join(" → ")}`,
  retriever: "RetrieverService giver Læs artikel",
  online: "AccessUrl giver Se online, men kun når FBI's linktjek siger OK",
  digitalCopy: "DigitalArticleService giver Bestil digital kopi",
  printedIssue: "InterLibraryLoan giver Find det trykte nummer, når der er en hostPublication",
  otherAccess: "Andre adgangstyper bruges ikke for artikler",
  oneOfEachKind: "Hver adgangsvej bruges kun én gang",
  defaultEdition: "Standardudgaven er den med den bedste virkende adgangsvej; ved lighed den nyeste",
}

type AccessEvaluation = { way?: AccessWay; rule: string; outcome: string }

const evaluateAccessEntry = (access: Access, manifestation: Manifestation): AccessEvaluation => {
  switch (access.__typename) {
    case "RetrieverService":
      return {
        way: { kind: "read-article", retrieverId: access.id },
        rule: accessRules.retriever,
        outcome: "Adgangsvej: Læs artikel",
      }
    case "AccessUrl":
      return access.status === "OK"
        ? { way: { kind: "online", url: access.url }, rule: accessRules.online, outcome: "Adgangsvej: Se online" }
        : { rule: accessRules.online, outcome: "Sprunget over: linket virker ikke" }
    case "DigitalArticleService":
      return { way: { kind: "digital-copy" }, rule: accessRules.digitalCopy, outcome: "Adgangsvej: Bestil digital kopi" }
    case "InterLibraryLoan":
      return manifestation.hostPublication
        ? {
            way: { kind: "printed-issue", hostTitle: manifestation.hostPublication.title },
            rule: accessRules.printedIssue,
            outcome: "Adgangsvej: Find det trykte nummer",
          }
        : { rule: accessRules.printedIssue, outcome: "Sprunget over: ingen hostPublication" }
    default:
      return { rule: accessRules.otherAccess, outcome: "Ignoreret" }
  }
}

const describeAccessEntry = (access: Access, index: number) => {
  const path = `access[${index}] ${access.__typename}`
  switch (access.__typename) {
    case "AccessUrl":
      return `${path}.status = ${access.status} (${access.origin})`
    case "RetrieverService":
      return `${path}.id = ${access.id}`
    case "DigitalArticleService":
      return `${path}.issn = ${access.issn}`
    case "InterLibraryLoan":
      return `${path}.loanIsPossible = ${access.loanIsPossible}`
    default:
      return path
  }
}

/**
 * The working ways to the article, best first and one of each kind, with a
 * trace row for every FBI access entry saying what became of it.
 */
export const evaluateAccess = (manifestation: Manifestation): { ways: AccessWay[]; rows: TraceRow[] } => {
  const ways: AccessWay[] = []
  const rows = manifestation.access.map((access, index): TraceRow => {
    const input = describeAccessEntry(access, index)
    const { way, rule, outcome } = evaluateAccessEntry(access, manifestation)
    if (!way) return { rule, input, outcome }
    if (ways.some((existing) => existing.kind === way.kind)) {
      return { rule: accessRules.oneOfEachKind, input, outcome: "Sprunget over: findes allerede" }
    }
    ways.push(way)
    return { rule, input, outcome }
  })
  ways.sort((first, second) => accessWayRank.indexOf(first.kind) - accessWayRank.indexOf(second.kind))
  return { ways, rows }
}

export const getAccessWays = (manifestation: Manifestation) => evaluateAccess(manifestation).ways

/** Whether the manifestation has an online link, none of which works. */
export const hasOnlyDeadLinks = (manifestation: Manifestation) => {
  const links = manifestation.access.filter((access) => access.__typename === "AccessUrl")
  return links.length > 0 && links.every((link) => link.status !== "OK")
}

const accessScore = (manifestation: Manifestation) => {
  const [bestWay] = getAccessWays(manifestation)
  return bestWay ? accessWayRank.indexOf(bestWay.kind) : accessWayRank.length
}

export const getPublicationYear = (manifestation: Manifestation) =>
  manifestation.hostPublication?.year?.year ?? manifestation.edition?.publicationYear?.year ?? undefined

/** The editions ranked by best working access way, then newest, with a trace row each. */
export const rankEditions = (manifestations: Manifestation[]) => {
  const ranked = [...manifestations].sort(
    (first, second) =>
      accessScore(first) - accessScore(second) || (getPublicationYear(second) ?? 0) - (getPublicationYear(first) ?? 0)
  )
  const rows = ranked.map((manifestation, index): TraceRow => {
    const [bestWay] = getAccessWays(manifestation)
    return {
      rule: accessRules.defaultEdition,
      input: `${manifestation.pid}: bedste adgangsvej = ${bestWay ? accessWayLabels[bestWay.kind] : "ingen"}, år = ${getPublicationYear(manifestation) ?? "ukendt"}`,
      outcome: index === 0 ? "Nr. 1 → standardudgave" : `Nr. ${index + 1}`,
    }
  })
  return { ranked, rows }
}

/** The manifestation with the best working access way; the newest of those. */
export const pickFastestAccess = (manifestations: Manifestation[]) => rankEditions(manifestations).ranked[0]
