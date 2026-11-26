import type { Manifestation } from "../../../fbi/types"
import type { TraceRow } from "../../trace"

/**
 * One way to get to an article. Ranked as the ticket orders them: read it in
 * Retriever, see it online, order a digital copy. Interlibrary loan, the
 * ticket's "find the printed issue", is left out.
 */
export type AccessWay =
  | { kind: "read-article"; retrieverId: string }
  | { kind: "online"; url: string; host: string }
  | { kind: "digital-copy" }

type Access = Manifestation["access"][number]

export const accessWayRank: AccessWay["kind"][] = ["read-article", "online", "digital-copy"]

export const accessWayLabels: Record<AccessWay["kind"], string> = {
  "read-article": "Læs artikel",
  online: "Se online",
  "digital-copy": "Bestil digital kopi",
}

/** The access rules in words, shared by the trace rows and the debug panel's rule list. */
export const accessRules = {
  ranking: `Adgangsveje prioriteres: ${accessWayRank.map((kind) => accessWayLabels[kind]).join(" → ")}`,
  retriever: "RetrieverService giver Læs artikel",
  online: "AccessUrl giver Se online, men kun når FBI's linktjek siger OK",
  digitalCopy: "DigitalArticleService giver Bestil digital kopi",
  interLibraryLoan: "InterLibraryLoan giver ingen mulighed; tidsskriftet nås fra Udgivet i under Detaljer",
  otherAccess: "Andre adgangstyper bruges ikke for artikler",
  oneOfEachKind: "Hver adgangsvej bruges kun én gang; online-links kun én gang pr. websted",
  severalLinks: "Flere virkende online-links giver hver sin mulighed, navngivet efter webstedet",
  defaultEdition: "Standardudgaven er den nyeste med en virkende adgangsvej; har ingen en adgangsvej, den nyeste",
}

const getHost = (access: { url: string; origin: string }) => {
  try {
    return new URL(access.url).hostname.replace(/^www\./, "")
  } catch {
    return access.origin
  }
}

/** Tells ways apart, also two online links: "online:doi.org". Used in ?accessWay=. */
export const getAccessWayKey = (way: AccessWay) => (way.kind === "online" ? `online:${way.host}` : way.kind)

/** The way's name among its edition's ways: online links are named by their site when there are several. */
export const getAccessWayLabel = (way: AccessWay, editionWays: AccessWay[]) => {
  const onlineCount = editionWays.filter((candidate) => candidate.kind === "online").length
  return way.kind === "online" && onlineCount > 1 ? `Se online på ${way.host}` : accessWayLabels[way.kind]
}

type AccessEvaluation = { way?: AccessWay; rule: string; outcome: string }

const evaluateAccessEntry = (access: Access): AccessEvaluation => {
  switch (access.__typename) {
    case "RetrieverService":
      return {
        way: { kind: "read-article", retrieverId: access.id },
        rule: accessRules.retriever,
        outcome: "Adgangsvej: Læs artikel",
      }
    case "AccessUrl":
      return access.status === "OK"
        ? {
            way: { kind: "online", url: access.url, host: getHost(access) },
            rule: accessRules.online,
            outcome: `Adgangsvej: Se online (${getHost(access)})`,
          }
        : { rule: accessRules.online, outcome: "Sprunget over: linket virker ikke" }
    case "DigitalArticleService":
      return { way: { kind: "digital-copy" }, rule: accessRules.digitalCopy, outcome: "Adgangsvej: Bestil digital kopi" }
    case "InterLibraryLoan":
      return { rule: accessRules.interLibraryLoan, outcome: "Ignoreret" }
    default:
      return { rule: accessRules.otherAccess, outcome: "Ignoreret" }
  }
}

const describeAccessEntry = (access: Access, index: number) => {
  const path = `access[${index}] ${access.__typename}`
  switch (access.__typename) {
    case "AccessUrl":
      return `${path}.status = ${access.status} (${access.origin}, ${access.url})`
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
 * The working ways to the article, best first and one of each kind (online
 * links one per site), with a trace row for every FBI access entry saying
 * what became of it.
 */
export const evaluateAccess = (manifestation: Manifestation): { ways: AccessWay[]; rows: TraceRow[] } => {
  const ways: AccessWay[] = []
  const rows = manifestation.access.map((access, index): TraceRow => {
    const input = describeAccessEntry(access, index)
    const { way, rule, outcome } = evaluateAccessEntry(access)
    if (!way) return { rule, input, outcome }
    if (ways.some((existing) => getAccessWayKey(existing) === getAccessWayKey(way))) {
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

export const getPublicationYear = (manifestation: Manifestation) =>
  manifestation.hostPublication?.year?.year ?? manifestation.edition?.publicationYear?.year ?? undefined

const hasAccessWay = (manifestation: Manifestation) => getAccessWays(manifestation).length > 0

/**
 * The editions ranked newest first, those with a working access way ahead of
 * those without, with a trace row each.
 */
export const rankEditions = (manifestations: Manifestation[]) => {
  const ranked = [...manifestations].sort(
    (first, second) =>
      Number(hasAccessWay(second)) - Number(hasAccessWay(first)) ||
      (getPublicationYear(second) ?? 0) - (getPublicationYear(first) ?? 0)
  )
  const rows = ranked.map((manifestation, index): TraceRow => {
    const [bestWay] = getAccessWays(manifestation)
    return {
      rule: accessRules.defaultEdition,
      input: `${manifestation.pid}: år = ${getPublicationYear(manifestation) ?? "ukendt"}, bedste adgangsvej = ${bestWay ? accessWayLabels[bestWay.kind] : "ingen"}`,
      outcome: index === 0 ? "Nr. 1 → standardudgave" : `Nr. ${index + 1}`,
    }
  })
  return { ranked, rows }
}
