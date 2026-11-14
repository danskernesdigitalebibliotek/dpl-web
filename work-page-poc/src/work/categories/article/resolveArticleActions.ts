import type { Manifestation } from "../../../fbi/types"
import type { TraceRow } from "../../trace"
import { type AccessWay, accessWayLabels, evaluateAccess, hasOnlyDeadLinks } from "./accessWays"
import { getAccessWayText } from "./articleText"

// The artifact shows one primary and one secondary way, never more.
export const shownWayCount = 2

export const actionRules = {
  buttonLimit: `Højst ${shownWayCount} knapper: den første er primær, den næste sekundær`,
  patronOnly: "Læs artikel og Bestil digital kopi kræver et brugertoken og er spærret for spærrede lånere",
  login: "Uden brugertoken beder et klik på Læs artikel eller Bestil digital kopi om login",
  deadLink: "Har manifestationen kun døde online-links, siges det",
  noAccess: "Uden adgangsveje vises Kontakt biblioteket",
  wayText: "Den første adgangsvej forklares under knapperne",
  recommended: "Er en anden udgave anbefalet, peges der på Skift",
}

export type ArticleButton = { way: AccessWay; label: string; variant: "primary" | "secondary" | "disabled" }

type ArticleActionsInput = {
  manifestation: Manifestation
  hasUserToken: boolean
  isBlocked: boolean
  hasOtherEditions: boolean
  isRecommended: boolean
  hasClickedWithoutLogin: boolean
}

const needsPatron = (way: AccessWay) => way.kind === "read-article" || way.kind === "digital-copy"

/**
 * Every decision behind the article's buttons and status lines. The page
 * renders the result, and the debug panel renders the trace of the same call.
 */
export const resolveArticleActions = ({
  manifestation,
  hasUserToken,
  isBlocked,
  hasOtherEditions,
  isRecommended,
  hasClickedWithoutLogin,
}: ArticleActionsInput) => {
  const access = evaluateAccess(manifestation)
  const shownWays = access.ways.slice(0, shownWayCount)

  const buttons = shownWays.map(
    (way, index): ArticleButton =>
      needsPatron(way) && isBlocked
        ? { way, label: "Spærret", variant: "disabled" }
        : { way, label: accessWayLabels[way.kind], variant: index === 0 ? "primary" : "secondary" }
  )

  const buttonRows = access.ways.map(
    (way, index): TraceRow => ({
      rule: actionRules.buttonLimit,
      input: `Adgangsvej ${index + 1}: ${accessWayLabels[way.kind]}`,
      outcome: index >= shownWayCount ? "Skjult" : index === 0 ? "Primær knap" : "Sekundær knap",
    })
  )

  const patronRows: TraceRow[] = shownWays.some(needsPatron)
    ? [
        {
          rule: actionRules.login,
          input: `brugertoken: ${hasUserToken ? "sat" : "mangler"}`,
          outcome: hasUserToken ? "Knapperne virker" : "Klik viser en login-besked",
        },
        {
          rule: actionRules.patronOnly,
          input: `usePatron().isLocked = ${hasUserToken ? isBlocked : "(ingen låner)"}`,
          outcome: isBlocked ? "Knapperne vises som Spærret" : "Ikke spærret",
        },
      ]
    : []

  const statusCandidates: { rule: string; text: string | false }[] = [
    { rule: actionRules.deadLink, text: hasOnlyDeadLinks(manifestation) && "Online-adgangen virker ikke lige nu." },
    {
      rule: actionRules.patronOnly,
      text: isBlocked && shownWays.some(needsPatron) && "Du er spærret og kan ikke bestille eller læse artikler her lige nu.",
    },
    {
      rule: actionRules.login,
      text:
        hasClickedWithoutLogin && "Du skal være logget ind. Tilføj et lånertoken under forbindelsesindstillinger (⚙).",
    },
    {
      rule: actionRules.noAccess,
      text:
        shownWays.length === 0 &&
        "Artiklen kan ikke tilgås her lige nu. Kontakt biblioteket, så hjælper vi dig med at finde den.",
    },
    { rule: actionRules.wayText, text: shownWays.length > 0 && !isBlocked && getAccessWayText(shownWays[0]) },
    {
      rule: actionRules.recommended,
      text: shownWays.length > 0 && hasOtherEditions && !isRecommended && "Den anbefalede udgave kan vælges under Skift.",
    },
  ]
  const statusLines = statusCandidates.flatMap((candidate) => (candidate.text ? [candidate.text] : []))
  const statusRows = statusCandidates.map(
    (candidate): TraceRow => ({
      rule: candidate.rule,
      input: candidate.text ? `"${candidate.text}"` : "–",
      outcome: candidate.text ? "Vises" : "Vises ikke",
    })
  )

  return {
    buttons,
    hasNoAccess: shownWays.length === 0,
    statusLines,
    accessRows: access.rows,
    buttonRows: [...buttonRows, ...patronRows],
    statusRows,
  }
}
