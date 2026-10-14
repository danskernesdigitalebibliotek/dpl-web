"use client"

import React, { useState } from "react"

import { Button } from "@/components/shared/button/Button"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import { type TEditionChoice } from "@/components/shared/editionsSelectModal/editionChoice"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
import { useDigitalEditionAvailability } from "@/hooks/useDigitalEditionAvailability"
import { useShownEditions } from "@/hooks/useShownEditions"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type EditionsSelectModalProps = {
  wid: string
  // The type to list editions for, captured when the modal opens. Not read
  // from the url, which lags behind a material-type tap.
  materialTypeCode: string
  choice: TEditionChoice
  // The material type is handed back with the choice: it is the type the modal
  // actually listed editions for, so the caller never has to guess which type
  // a pid belongs to.
  onChoiceConfirm: (choice: TEditionChoice, materialTypeCode: string) => void
  // Runs on every close — a confirmed choice, the close button, Escape or a
  // click outside. The modal renders outside the trigger's tree, so returning
  // focus to the trigger is the caller's to do.
  onClosed?: () => void
}

// The group names are used for the native radios, which are hidden but keep the accessibility tree semantics of a radio group.
const GENERAL_CHOICE_GROUP = "edition-general-choice"
const EDITION_CHOICE_GROUP = "edition-pid"

const GeneralOption = ({
  label,
  description,
  checked,
  onSelect,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onSelect: () => void
  // "Først tilgængelige" has no backing logic yet — it renders as a visual
  // placeholder the reader can't actually select.
  disabled?: boolean
}) => (
  <label
    className="border-foreground/10 has-checked:border-foreground has-checked:bg-background-overlay
      has-focus-visible:ring-foreground flex w-full cursor-pointer items-start gap-3 rounded-lg
      border-2 p-4 transition-colors has-focus-visible:ring-2 has-focus-visible:ring-offset-2
      has-disabled:cursor-not-allowed has-disabled:opacity-50">
    <input
      type="radio"
      name={GENERAL_CHOICE_GROUP}
      className="sr-only"
      checked={checked}
      disabled={disabled}
      onChange={onSelect}
    />
    {/* The radio is drawn rather than native so it matches the design; the
        real input stays in the accessibility tree via sr-only. */}
    <span
      aria-hidden="true"
      className="border-foreground mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center
        rounded-full border-2">
      {checked && <span className="bg-foreground h-2.5 w-2.5 rounded-full" />}
    </span>
    <span className="min-w-0">
      <span className="text-typo-subtitle-md block">{label}</span>
      <span className="text-typo-body-sm block opacity-70">{description}</span>
    </span>
  </label>
)

const EditionsSelectModal = ({
  open,
  onClose,
  wid,
  materialTypeCode,
  choice,
  onChoiceConfirm,
  onClosed,
}: EditionsSelectModalProps & { open: boolean; onClose: () => void }) => {
  const {
    editions,
    shownEditions,
    isLoadingAvailability,
    isAvailabilityUnknown,
    isEditionLentOut,
  } = useShownEditions(wid, materialTypeCode)
  const { isLoadingDigitalAvailability, isDigitalEditionOnLoan } =
    useDigitalEditionAvailability(wid)

  // Physical editions can be reserved, so being lent out is not a dead end.
  // Digital ones cannot, so the wording stops at the fact. Each predicate
  // answers false for the other provider's material type, so at most one of
  // them is ever true.
  //
  // `label` and `text` are decided together and say the same thing: the pill
  // is hidden from the accessibility tree, so `text` is what carries the
  // status into the edition's accessible name.
  const getUnavailable = (manifestation: ManifestationWorkPageFragment) => {
    if (isEditionLentOut(manifestation)) {
      return {
        label: (
          <StatusLabel variant="warning" subline="Du kan stadig reservere bogen">
            Udlånt lige nu
          </StatusLabel>
        ),
        text: "Udlånt lige nu, du kan stadig reservere bogen",
      }
    }
    if (isDigitalEditionOnLoan(manifestation)) {
      return {
        label: <StatusLabel variant="warning">Udlånt lige nu</StatusLabel>,
        text: "Udlånt lige nu",
      }
    }
    return undefined
  }

  // Editions are newest first, so the first shown one is what "nyeste" means.
  const newestDescription = [
    shownEditions[0]?.edition?.publicationYear?.year,
    shownEditions[0]?.publisher?.[0],
  ]
    .filter(Boolean)
    .join(", ")

  // The grid waits for both providers, so an edition never renders live and
  // then picks up a status a moment later.
  const isLoadingEditions = isLoadingAvailability || isLoadingDigitalAvailability

  // The pick the reader is considering. Arrow keys move the selection within a
  // radio group, so selecting cannot be what confirms — a keyboard user would
  // never reach past the first edition the arrow lands on. The footer button
  // confirms instead, and nothing leaves the modal until then.
  const [draftChoice, setDraftChoice] = useState<TEditionChoice>(choice)
  const draftPid = typeof draftChoice === "object" ? draftChoice.pid : null

  // Every close runs through here, so the caller gets `onClosed` whether the
  // reader confirmed a choice, used the close button, pressed Escape or
  // clicked outside.
  const handleClose = () => {
    onClose()
    onClosed?.()
  }

  const handleConfirm = () => {
    onChoiceConfirm(draftChoice, materialTypeCode)
    handleClose()
  }

  return (
    <ResponsiveDialog title="Vælg udgave" open={open} onClose={handleClose}>
      {/* Two radio groups, so each gets its own fieldset: a general rule for
          which edition to get, or one specific edition. */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="sr-only">Vælg generel udgave</legend>
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
          <GeneralOption
            label="Nyeste udgave"
            description={`Du får altid den senest udgivne udgave${
              newestDescription ? ` — lige nu ${newestDescription}` : ""
            }`}
            checked={draftChoice === "newest"}
            onSelect={() => setDraftChoice("newest")}
          />
        </div>
      </fieldset>

      {(isLoadingEditions || shownEditions.length > 0) && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="sr-only">Vælg udgave</legend>
          <div aria-hidden="true" className="my-8 flex items-center gap-4">
            <hr className="border-foreground/10 flex-1" />
            <span className="text-typo-label-sm shrink-0 font-semibold opacity-70">
              Eller vælg en bestemt udgave · {shownEditions.length}
            </span>
            <hr className="border-foreground/10 flex-1" />
          </div>

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
                      onSelect={() => setDraftChoice({ pid: manifestation.pid })}
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
        <Button theme="primary" size="lg" onClick={handleConfirm}>
          Vælg udgave
        </Button>
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default EditionsSelectModal
