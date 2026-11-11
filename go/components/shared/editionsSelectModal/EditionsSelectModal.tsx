"use client"

import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { useDigitalEditionsAvailabilityBiblio } from "@/hooks/useDigitalEditionsAvailabilityBiblio"
import { useShownEditions } from "@/hooks/useShownEditions"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type EditionsSelectModalProps = {
  wid: string
  // The type to list editions for, captured when the modal opens. Not read
  // from the url, which lags behind a material-type tap.
  materialTypeCode: string
  // The edition the picker opens on.
  choicePid: string
  // The material type is handed back with the pid: it is the type the modal
  // actually listed editions for, so the caller never has to guess which type
  // a pid belongs to.
  onChoiceConfirm: (pid: string, materialTypeCode: string) => void
  // Runs on every close — a confirmed choice, the close button, Escape or a
  // click outside. The modal renders outside the trigger's tree, so returning
  // focus to the trigger is the caller's to do.
  onClosed?: () => void
}

// The group name is used for the native radios, which are hidden but keep the accessibility tree semantics of a radio group.
const EDITION_CHOICE_GROUP = "edition-pid"

const EditionsSelectModal = ({
  open,
  onClose,
  wid,
  materialTypeCode,
  choicePid,
  onChoiceConfirm,
  onClosed,
}: EditionsSelectModalProps & { open: boolean; onClose: () => void }) => {
  const {
    editions,
    shownEditions,
    isLoadingAvailability,
    isAvailabilityUnknown,
    isEditionLentOut,
    getEditionQueueText,
  } = useShownEditions(wid, materialTypeCode)
  const { isLoadingDigitalAvailability, isDigitalEditionOnLoan } =
    useDigitalEditionsAvailabilityBiblio(shownEditions)

  // Physical editions can be reserved, so being lent out is not a dead end.
  // Digital ones cannot, so the wording stops at the fact. Each predicate
  // answers false for the other provider's material type, so at most one of
  // them is ever true.
  //
  // `label` and `text` are decided together and say the same thing: the pill
  // is hidden from the accessibility tree, so `text` is what carries the
  // status into the edition's accessible name. Both stay selectable — a
  // digital edition already on loan to this reader is exactly the one they'd
  // want to pick, to read it from the work page.
  const getUnavailable = (manifestation: ManifestationWorkPageFragment) => {
    if (isEditionLentOut(manifestation)) {
      const queueText = getEditionQueueText(manifestation) ?? ""
      return {
        label: (
          <StatusLabel variant="warning" subline={queueText}>
            Udlånt lige nu
          </StatusLabel>
        ),
        text: `Udlånt lige nu${queueText ? `, ${queueText}` : ""}`,
      }
    }
    if (isDigitalEditionOnLoan(manifestation)) {
      return {
        label: <StatusLabel variant="warning">Udlånt til dig</StatusLabel>,
        text: "Udlånt til dig",
      }
    }
    return undefined
  }

  // The grid waits for both providers, so an edition never renders live and
  // then picks up a status a moment later.
  const isLoadingEditions = isLoadingAvailability || isLoadingDigitalAvailability

  // The pick the reader is considering. Arrow keys move the selection within a
  // radio group, so selecting cannot be what confirms — a keyboard user would
  // never reach past the first edition the arrow lands on. The footer button
  // confirms instead, and nothing leaves the modal until then.
  const [draftPid, setDraftPid] = useState(choicePid)

  // Every close runs through here, so the caller gets `onClosed` whether the
  // reader confirmed a choice, used the close button, pressed Escape or
  // clicked outside.
  const handleClose = () => {
    onClose()
    onClosed?.()
  }

  const handleConfirm = () => {
    onChoiceConfirm(draftPid, materialTypeCode)
    handleClose()
  }

  return (
    <ResponsiveDialog title="Vælg udgave" open={open} onClose={handleClose}>
      {(isLoadingEditions || shownEditions.length > 0) && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Vælg udgave</legend>

          {/* Drops from 4 columns at md back to 3 at lg: the dialog's own
              max-width caps there, so each card gets more room instead of
              more columns. */}
          <div
            className="grid grid-cols-2 gap-x-6 gap-y-7 sm:grid-cols-3 md:grid-cols-4
              lg:grid-cols-3">
            {isLoadingEditions
              ? editions.map(manifestation => (
                  <EditionsSelectModalItem.Skeleton key={manifestation.pid} />
                ))
              : shownEditions.map(manifestation => {
                  const unavailable = getUnavailable(manifestation)
                  return (
                    <EditionsSelectModalItem
                      key={manifestation.pid}
                      manifestation={manifestation}
                      name={EDITION_CHOICE_GROUP}
                      checked={draftPid === manifestation.pid}
                      unavailableLabel={unavailable?.label}
                      unavailableText={unavailable?.text}
                      onSelect={() => setDraftPid(manifestation.pid)}
                    />
                  )
                })}
          </div>
        </fieldset>
      )}

      {/* The editions arrive after the dialog has opened, so what replaces
          the skeletons is announced rather than appearing silently. */}
      <div role="status">
        {/* Availability could not be read, so every edition is shown
            unmarked. */}
        {isAvailabilityUnknown && (
          <p className="text-typo-caption mt-8 opacity-70">
            Vi kan ikke se hvilke bøger der er hjemme lige nu.
          </p>
        )}

        {/* Two different empty states: the work has no editions of this type
            at all, or the kommune has none of the ones it does have. */}
        {!isLoadingEditions && shownEditions.length === 0 && (
          <p className="text-typo-caption mt-8">
            {editions.length === 0
              ? "Ingen udgaver for denne materialetype."
              : "Der er ingen udgaver af denne bog på dit bibliotek."}
          </p>
        )}
      </div>

      <ResponsiveDialog.Actions>
        <Button size="lg" onClick={handleClose}>
          Annuller
        </Button>
        <Button theme="primary" size="lg" onClick={handleConfirm}>
          Vælg udgave
        </Button>
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default EditionsSelectModal
