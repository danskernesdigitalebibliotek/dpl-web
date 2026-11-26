import type { Manifestation } from "../../../fbi/types"
import type { TraceRow } from "../../trace"
import { type AccessWay, accessWayLabels, hasOnlyDeadLinks } from "./accessWays"
import { getAccessWayText } from "./articleText"

export const actionRules = {
  oneButton: "Siden har én knap: den valgte adgangsvej",
  patronOnly: "Læs artikel og Bestil digital kopi kræver et brugertoken og er spærret for spærrede lånere",
  login: "Uden brugertoken beder et klik på Læs artikel eller Bestil digital kopi om login",
  deadLink: "Har manifestationen kun døde online-links, siges det",
  noAccess: "Uden adgangsveje vises Kontakt biblioteket",
  wayText: "Under knappen står, hvad der sker, når man trykker",
}

export type ArticleAction = { way: AccessWay; label: string; isDisabled: boolean }

type PeriodicalLink = { to: string; rows: TraceRow[] }

type ArticleActionInput = {
  manifestation: Manifestation
  selectedWay: AccessWay | undefined
  hasUserToken: boolean
  isBlocked: boolean
  hasClickedWithoutLogin: boolean
  /** Where "Find det trykte nummer" leads, when that is the selected way. */
  periodicalLink: PeriodicalLink | undefined
}

const needsPatron = (way: AccessWay) => way.kind === "read-article" || way.kind === "digital-copy"

/**
 * The page's one button and the texts under it. The page renders the result,
 * and the debug panel renders the trace of the same call.
 */
export const resolveArticleAction = ({
  manifestation,
  selectedWay,
  hasUserToken,
  isBlocked,
  hasClickedWithoutLogin,
  periodicalLink,
}: ArticleActionInput) => {
  const isPatronWay = Boolean(selectedWay && needsPatron(selectedWay))
  const isDisabled = isPatronWay && isBlocked
  const action: ArticleAction | undefined = selectedWay && {
    way: selectedWay,
    label: isDisabled ? "Spærret" : accessWayLabels[selectedWay.kind],
    isDisabled,
  }

  const buttonRow: TraceRow = {
    rule: actionRules.oneButton,
    input: selectedWay ? `Valgt adgangsvej: ${accessWayLabels[selectedWay.kind]}` : "Ingen adgangsvej",
    outcome: action ? `Knap: ${action.label}` : "Kontakt biblioteket",
  }
  const patronRows: TraceRow[] = isPatronWay
    ? [
        {
          rule: actionRules.login,
          input: `brugertoken: ${hasUserToken ? "sat" : "mangler"}`,
          outcome: hasUserToken ? "Knappen virker" : "Klik viser en login-besked",
        },
        {
          rule: actionRules.patronOnly,
          input: `usePatron().isLocked = ${hasUserToken ? isBlocked : "(ingen låner)"}`,
          outcome: isBlocked ? "Knappen vises som Spærret" : "Ikke spærret",
        },
      ]
    : []

  const textCandidates: { rule: string; text: string | false }[] = [
    { rule: actionRules.wayText, text: selectedWay && !isDisabled ? getAccessWayText(selectedWay) : false },
    { rule: actionRules.deadLink, text: hasOnlyDeadLinks(manifestation) && "Online-adgangen virker ikke lige nu." },
    {
      rule: actionRules.patronOnly,
      text: isDisabled && "Du er spærret og kan ikke bestille eller læse artikler her lige nu.",
    },
    {
      rule: actionRules.login,
      text: hasClickedWithoutLogin && "Du skal være logget ind. Tilføj et lånertoken under forbindelsesindstillinger (⚙).",
    },
    {
      rule: actionRules.noAccess,
      text: !selectedWay && "Artiklen kan ikke tilgås her lige nu. Kontakt biblioteket, så hjælper vi dig med at finde den.",
    },
  ]
  const texts = textCandidates.flatMap((candidate) => (candidate.text ? [candidate.text] : []))
  const textRows = textCandidates.map(
    (candidate): TraceRow => ({
      rule: candidate.rule,
      input: candidate.text ? `"${candidate.text}"` : "–",
      outcome: candidate.text ? "Vises" : "Vises ikke",
    })
  )

  return {
    action,
    printedIssueTo: periodicalLink?.to,
    texts,
    actionRows: [buttonRow, ...patronRows, ...(periodicalLink?.rows ?? [])],
    textRows,
  }
}
