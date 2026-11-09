import type { Manifestation } from "../../../fbi/types"

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

const accessWayRank: AccessWay["kind"][] = ["read-article", "online", "digital-copy", "printed-issue"]

const toAccessWay = (access: Access, manifestation: Manifestation): AccessWay | undefined => {
  switch (access.__typename) {
    case "RetrieverService":
      return { kind: "read-article", retrieverId: access.id }
    // A link FBI's link check doesn't report as working is skipped, so the
    // next way takes over.
    case "AccessUrl":
      return access.status === "OK" ? { kind: "online", url: access.url } : undefined
    case "DigitalArticleService":
      return { kind: "digital-copy" }
    case "InterLibraryLoan":
      return manifestation.hostPublication
        ? { kind: "printed-issue", hostTitle: manifestation.hostPublication.title }
        : undefined
    default:
      return undefined
  }
}

/** The working ways to the article, best first, one of each kind. */
export const getAccessWays = (manifestation: Manifestation): AccessWay[] => {
  const ways = manifestation.access
    .map((access) => toAccessWay(access, manifestation))
    .filter((way): way is AccessWay => way !== undefined)
  const firstOfEachKind = ways.filter(
    (way, index) => ways.findIndex((candidate) => candidate.kind === way.kind) === index
  )
  return firstOfEachKind.sort((first, second) => accessWayRank.indexOf(first.kind) - accessWayRank.indexOf(second.kind))
}

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

/** The manifestation with the best working access way; the newest of those. */
export const pickFastestAccess = (manifestations: Manifestation[]) =>
  [...manifestations].sort(
    (first, second) =>
      accessScore(first) - accessScore(second) || (getPublicationYear(second) ?? 0) - (getPublicationYear(first) ?? 0)
  )[0]

export const accessWayLabels: Record<AccessWay["kind"], string> = {
  "read-article": "Læs artikel",
  online: "Se online",
  "digital-copy": "Bestil digital kopi",
  "printed-issue": "Find det trykte nummer",
}
