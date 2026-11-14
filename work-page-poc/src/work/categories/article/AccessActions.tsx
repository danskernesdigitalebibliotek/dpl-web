import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useState } from "react"

import { useConnectionSettings } from "../../../connection/useConnectionSettings"
import type { Manifestation } from "../../../fbi/types"
import { ActionButton } from "../../../ui/ActionButton"
import type { ArticleButton } from "./resolveArticleActions"
import { DigitalCopyDialog } from "./DigitalCopyDialog"
import { RetrieverDialog } from "./RetrieverDialog"
import { useArticleActions } from "./useArticleActions"

type AccessActionsProps = {
  manifestation: Manifestation
  categoryManifestations: Manifestation[]
  title: string
}

/** The article's access ways as buttons, with the status lines under them. */
export const AccessActions = ({ manifestation, categoryManifestations, title }: AccessActionsProps) => {
  const { settings } = useConnectionSettings()
  const { data: patron } = usePatron()
  const [openDialog, setOpenDialog] = useState<"read-article" | "digital-copy" | null>(null)
  const [hasClickedWithoutLogin, setHasClickedWithoutLogin] = useState(false)
  const { buttons, hasNoAccess, statusLines } = useArticleActions(
    manifestation,
    categoryManifestations,
    hasClickedWithoutLogin
  )

  const retrieverWay = buttons.map((button) => button.way).find((way) => way.kind === "read-article")

  const openWay = (kind: "read-article" | "digital-copy") => {
    if (!settings.userToken) {
      setHasClickedWithoutLogin(true)
      return
    }
    setOpenDialog(kind)
  }

  const renderButton = ({ way, label, variant }: ArticleButton) => {
    if (variant === "disabled") {
      return (
        <ActionButton key={way.kind} variant="disabled" onClick={() => {}}>
          {label}
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
          <ActionButton key={way.kind} variant={variant} onClick={() => openWay(way.kind)}>
            {label}
          </ActionButton>
        )
    }
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {buttons.map(renderButton)}
        {hasNoAccess && (
          // A placeholder, as in the artifact: the PoC has no library to contact.
          <ActionButton variant="secondary" onClick={() => {}}>
            Kontakt biblioteket
          </ActionButton>
        )}
      </div>
      <div
        aria-live="polite"
        className="mt-5 text-body-m leading-[26px] text-text-body lg:mt-4 lg:text-body-s lg:leading-[22px] lg:text-text-heading"
      >
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
