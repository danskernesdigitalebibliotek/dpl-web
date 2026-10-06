"use client"

import React, { useMemo } from "react"

import { getEditionsForMaterialType } from "@/components/pages/workPageLayout/helper"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import { type TEditionChoice } from "@/components/shared/editionsSelectModal/editionChoice"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { useDigitalEditionAvailability } from "@/hooks/useDigitalEditionAvailability"
import { useEditionAvailability } from "@/hooks/useEditionAvailability"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"

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
}: EditionsSelectModalProps & { open: boolean; onClose: () => void }) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const allManifestations = data?.work?.manifestations?.all

  const editions = useMemo(
    () => getEditionsForMaterialType(allManifestations ?? [], materialTypeCode),
    [allManifestations, materialTypeCode]
  )

  const { isLoadingAvailability, isAvailabilityUnknown, isEditionHidden, isEditionLentOut } =
    useEditionAvailability(wid)
  const { isLoadingDigitalAvailability, isDigitalEditionOnLoan } =
    useDigitalEditionAvailability(wid)

  // Physical editions can be reserved, so being lent out is not a dead end.
  // Digital ones cannot, so the wording stops at the fact. Each predicate
  // answers false for the other provider's material type, so at most one of
  // them is ever true.
  const getUnavailableLabel = (manifestation: ManifestationWorkPageFragment) => {
    if (isEditionLentOut(manifestation)) {
      return "Udlånt lige nu, men du kan stadig reservere bogen"
    }
    if (isDigitalEditionOnLoan(manifestation)) {
      return "Udlånt lige nu"
    }
    return undefined
  }

  // Editions the kommune cannot supply are left out; lent-out ones stay.
  // Ordering is untouched, so what remains keeps its position.
  // See docs/go/material-availability.md
  const shownEditions = editions.filter(manifestation => !isEditionHidden(manifestation))

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

  const selectedPid = typeof choice === "object" ? choice.pid : null

  // Confirms the choice and closes the modal immediately.
  const handleChoice = (next: TEditionChoice) => {
    onChoiceConfirm(next, materialTypeCode)
    onClose()
  }

  return (
    <ResponsiveDialog title="Vælg udgave" open={open} onClose={onClose}>
      <fieldset className="border-0 p-0">
        <div className="xs:grid-cols-2 grid grid-cols-1 gap-4">
          <GeneralOption
            label="Nyeste udgave"
            description={`Du får altid den senest udgivne udgave${
              newestDescription ? ` — lige nu ${newestDescription}` : ""
            }`}
            checked={choice === "newest"}
            onSelect={() => handleChoice("newest")}
          />
          <GeneralOption
            label="Først tilgængelige"
            description="Du får den udgave med kortest ventetid — hurtigst i hænderne"
            checked={false}
            onSelect={() => {}}
            disabled
          />
        </div>

        {(isLoadingEditions || shownEditions.length > 0) && (
          <>
            <div className="my-8 flex items-center gap-4">
              <hr className="border-foreground/10 flex-1" />
              <span className="text-typo-label-sm shrink-0 font-semibold opacity-70">
                {/* Counts what is on screen, so the number matches the grid. */}
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
                : shownEditions.map(manifestation => (
                    <EditionsSelectModalItem
                      key={manifestation.pid}
                      manifestation={manifestation}
                      name={EDITION_CHOICE_GROUP}
                      checked={selectedPid === manifestation.pid}
                      unavailableLabel={getUnavailableLabel(manifestation)}
                      onSelect={() => handleChoice({ pid: manifestation.pid })}
                    />
                  ))}
            </div>
          </>
        )}

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
      </fieldset>
    </ResponsiveDialog>
  )
}

export default EditionsSelectModal
