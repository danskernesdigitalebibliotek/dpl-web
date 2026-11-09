import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useState } from "react"

import { useConnectionSettings } from "../../../connection/useConnectionSettings"
import type { Manifestation } from "../../../fbi/types"
import { ActionButton, type ActionButtonVariant } from "../../../ui/ActionButton"
import { type AccessWay, accessWayLabels, getAccessWays, hasOnlyDeadLinks } from "./accessWays"
import { getAccessWayText } from "./articleText"
import { DigitalCopyDialog } from "./DigitalCopyDialog"
import { RetrieverDialog } from "./RetrieverDialog"

// The artifact shows one primary and one secondary way, never more.
const shownWayCount = 2

const needsPatron = (way: AccessWay) => way.kind === "read-article" || way.kind === "digital-copy"

type AccessActionsProps = {
  manifestation: Manifestation
  title: string
  isRecommended: boolean
  hasOtherEditions: boolean
}

/** The article's access ways as buttons, with the status lines under them. */
export const AccessActions = ({ manifestation, title, isRecommended, hasOtherEditions }: AccessActionsProps) => {
  const { settings } = useConnectionSettings()
  const { data: patron } = usePatron()
  const [openDialog, setOpenDialog] = useState<"read-article" | "digital-copy" | null>(null)
  const [needsLogin, setNeedsLogin] = useState(false)

  const ways = getAccessWays(manifestation).slice(0, shownWayCount)
  const isBlocked = Boolean(patron?.isLocked)
  const retrieverWay = ways.find((way) => way.kind === "read-article")

  const takeWay = (way: AccessWay) => {
    if (!settings.userToken) {
      setNeedsLogin(true)
      return
    }
    if (way.kind === "read-article" || way.kind === "digital-copy") setOpenDialog(way.kind)
  }

  const renderWay = (way: AccessWay, index: number) => {
    const variant: ActionButtonVariant = index === 0 ? "primary" : "secondary"
    const label = accessWayLabels[way.kind]

    if (needsPatron(way) && isBlocked) {
      return (
        <ActionButton key={way.kind} variant="disabled" onClick={() => {}}>
          Spærret
        </ActionButton>
      )
    }
    switch (way.kind) {
      case "online":
        return (
          <ActionButton key={way.kind} variant={variant} href={way.url}>
            {label}
          </ActionButton>
        )
      case "printed-issue":
        return (
          <ActionButton key={way.kind} variant={variant} to={`/?q=${encodeURIComponent(way.hostTitle)}`}>
            {label}
          </ActionButton>
        )
      default:
        return (
          <ActionButton key={way.kind} variant={variant} onClick={() => takeWay(way)}>
            {label}
          </ActionButton>
        )
    }
  }

  const statusLines = [
    hasOnlyDeadLinks(manifestation) && "Online-adgangen virker ikke lige nu.",
    isBlocked && ways.some(needsPatron) && "Du er spærret og kan ikke bestille eller læse artikler her lige nu.",
    needsLogin && "Du skal være logget ind. Tilføj et lånertoken under forbindelsesindstillinger (⚙).",
    ways.length === 0 &&
      "Artiklen kan ikke tilgås her lige nu. Kontakt biblioteket, så hjælper vi dig med at finde den.",
    ways.length > 0 && !isBlocked && getAccessWayText(ways[0]),
    ways.length > 0 && hasOtherEditions && !isRecommended && "Den anbefalede udgave kan vælges under Skift.",
  ].filter((line): line is string => Boolean(line))

  return (
    <>
      <div className="flex flex-col gap-3">
        {ways.map(renderWay)}
        {ways.length === 0 && (
          // A placeholder, as in the artifact: the PoC has no library to contact.
          <ActionButton variant="secondary" onClick={() => {}}>
            Kontakt biblioteket
          </ActionButton>
        )}
      </div>
      <div aria-live="polite" className="mt-5 text-body-m leading-[26px] text-text-body lg:mt-4 lg:text-body-s lg:leading-[22px] lg:text-text-heading">
        {statusLines.map((line) => (
          <p key={line} className="m-0 mb-1.5 lg:mb-0">
            {line}
          </p>
        ))}
      </div>

      {retrieverWay?.kind === "read-article" && (
        <RetrieverDialog
          retrieverId={retrieverWay.retrieverId}
          title={title}
          open={openDialog === "read-article"}
          onClose={() => setOpenDialog(null)}
        />
      )}
      <DigitalCopyDialog
        title={title}
        email={patron?.emailAddress}
        open={openDialog === "digital-copy"}
        onClose={() => setOpenDialog(null)}
      />
    </>
  )
}
