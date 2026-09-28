"use client"

import React, { useEffect, useMemo, useState } from "react"

import { getEditionsForMaterialType } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import { type TEditionChoice } from "@/components/shared/editionsSelectModal/editionChoice"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import { useEditionAvailability } from "@/hooks/useEditionAvailability"
import { useGetMaterialQuery } from "@/lib/graphql/generated/fbi/graphql"

// Data props — `open`/`onClose` come from the DynamicModal host.
export type EditionsSelectModalProps = {
  wid: string
  // The type to list editions for, captured when the modal opens. The url is
  // not read here: a material-type tap navigates inside a transition, so
  // `useSearchParams` keeps returning the previous type until that navigation
  // commits, and a modal opened in between would list the type the reader just
  // left. The host mounts a fresh modal per opening, so this cannot go stale
  // while open.
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
}: {
  label: string
  description: string
  checked: boolean
  onSelect: () => void
}) => (
  <label
    className="border-foreground/10 has-checked:border-foreground has-checked:bg-background-overlay
      has-focus-visible:ring-foreground flex w-full max-w-[335px] cursor-pointer items-start gap-3
      rounded-lg border-2 p-4 transition-colors has-focus-visible:ring-2
      has-focus-visible:ring-offset-2 sm:w-1/2">
    <input
      type="radio"
      name={GENERAL_CHOICE_GROUP}
      className="sr-only"
      checked={checked}
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
      <span className="text-typo-subtitle-sm block">{label}</span>
      <span className="text-typo-caption block opacity-70">{description}</span>
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

  // The draft is reset to the current choice whenever the modal opens.
  const [draftChoice, setDraftChoice] = useState<TEditionChoice>(choice)
  useEffect(() => {
    if (open) {
      setDraftChoice(choice)
    }
  }, [open, choice])

  const editions = useMemo(
    () => getEditionsForMaterialType(allManifestations ?? [], materialTypeCode),
    [allManifestations, materialTypeCode]
  )

  const { isLoadingAvailability, isAvailabilityUnknown, isEditionHidden, isEditionLentOut } =
    useEditionAvailability(wid)

  // An edition the kommune can neither lend nor order is noise here, so it is
  // left out entirely rather than shown as a dead end. Editions that are only
  // lent out stay: reserving one is what a reader should do. Ordering is
  // untouched, so what remains keeps the position it had.
  const shownEditions = editions.filter(manifestation => !isEditionHidden(manifestation))

  // Editions are newest first, so the first one the kommune can actually
  // supply is what "nyeste" resolves to. Describing the unfiltered newest
  // would advertise an edition that is not even in the grid below.
  const newestDescription = [
    shownEditions[0]?.edition?.publicationYear?.year,
    shownEditions[0]?.publisher?.[0],
  ]
    .filter(Boolean)
    .join(", ")

  const selectedPid = typeof draftChoice === "object" ? draftChoice.pid : null

  const handleConfirm = () => {
    onChoiceConfirm(draftChoice, materialTypeCode)
    onClose()
  }

  return (
    <ResponsiveDialog title="Vælg udgave" open={open} onClose={onClose}>
      <fieldset className="border-0 p-0">
        <GeneralOption
          label="Nyeste udgave"
          description={`Du får altid den senest udgivne udgave${
            newestDescription ? ` — lige nu ${newestDescription}` : ""
          }`}
          checked={draftChoice === "newest"}
          onSelect={() => setDraftChoice("newest")}
        />

        {(isLoadingAvailability || shownEditions.length > 0) && (
          <>
            <div className="my-8 flex items-center gap-4">
              <hr className="border-foreground/10 flex-1" />
              <span className="text-typo-caption shrink-0 opacity-70">
                {/* Counts what is on screen, so the number matches the grid. */}
                Eller vælg en bestemt udgave · {shownEditions.length}
              </span>
              <hr className="border-foreground/10 flex-1" />
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-5">
              {isLoadingAvailability
                ? editions.map(manifestation => (
                    <EditionsSelectModalItem.Skeleton key={manifestation.pid} />
                  ))
                : shownEditions.map(manifestation => (
                    <EditionsSelectModalItem
                      key={manifestation.pid}
                      manifestation={manifestation}
                      name={EDITION_CHOICE_GROUP}
                      checked={selectedPid === manifestation.pid}
                      lentOut={isEditionLentOut(manifestation)}
                      onSelect={() => setDraftChoice({ pid: manifestation.pid })}
                    />
                  ))}
            </div>
          </>
        )}

        {/* Availability could not be read, so every edition is shown and none
            is marked. Says what is missing without implying the picker is
            broken — there is nothing here for a reader to retry. */}
        {isAvailabilityUnknown && (
          <p className="text-typo-caption mt-8 opacity-70">
            Vi kan ikke se hvilke bøger der er hjemme lige nu.
          </p>
        )}

        {/* Two different empty states: the work has no editions of this type
            at all, or the kommune has none of the ones it does have. */}
        {!isLoadingAvailability && shownEditions.length === 0 && (
          <p className="text-typo-caption mt-8">
            {editions.length === 0
              ? "Ingen udgaver for denne materialetype."
              : "Der er ingen udgaver af denne bog på dit bibliotek."}
          </p>
        )}
      </fieldset>

      <ResponsiveDialog.Actions>
        <Button theme="primary" size="lg" ariaLabel="Vælg udgave" onClick={handleConfirm}>
          Vælg udgave
        </Button>
      </ResponsiveDialog.Actions>
    </ResponsiveDialog>
  )
}

export default EditionsSelectModal
