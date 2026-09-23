"use client"

import React, { useEffect, useMemo, useState } from "react"

import { getEditionsForMaterialType } from "@/components/pages/workPageLayout/helper"
import { Button } from "@/components/shared/button/Button"
import EditionsSelectModalItem from "@/components/shared/editionsSelectModal/EditionsSelectModalItem"
import ResponsiveDialog from "@/components/shared/responsiveDialog/ResponsiveDialog"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"

// A pid is a pin to one specific edition. "newest" is the default and so is
// the absence of a choice — it is never written to the url.
export type TEditionChoice = "newest" | { pid: string }

export const DEFAULT_EDITION_CHOICE: TEditionChoice = "newest"

// The url carries the choice as a single `edition` param: a pid, or nothing at
// all for the default.
export const parseEditionChoice = (param: string | null): TEditionChoice => {
  if (!param) return DEFAULT_EDITION_CHOICE

  return { pid: param }
}

export const serializeEditionChoice = (choice: TEditionChoice): string | null => {
  if (choice === "newest") return null

  return choice.pid
}

// Label for the trigger button that opens the modal.
export const getEditionChoiceLabel = (
  choice: TEditionChoice,
  selectedManifestation: ManifestationWorkPageFragment
): string => {
  if (choice === "newest") return "Nyeste"

  return selectedManifestation.edition?.publicationYear?.year?.toString() ?? "Valgt udgave"
}

// Data props — `open`/`onClose` come from the DynamicModal host.
export type EditionsSelectModalProps = {
  wid: string
  // The material type code currently selected in MaterialTypeSelect.
  materialTypeCode: string
  choice: TEditionChoice
  onChoiceConfirm: (choice: TEditionChoice) => void
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

  // Editions are newest first.
  const newestDescription = [
    editions[0]?.edition?.publicationYear?.year,
    editions[0]?.publisher?.[0],
  ]
    .filter(Boolean)
    .join(", ")

  const selectedPid = typeof draftChoice === "object" ? draftChoice.pid : null

  const handleConfirm = () => {
    onChoiceConfirm(draftChoice)
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

        {editions.length > 0 && (
          <>
            <div className="my-8 flex items-center gap-4">
              <hr className="border-foreground/10 flex-1" />
              <span className="text-typo-caption shrink-0 opacity-70">
                Eller vælg en bestemt udgave · {editions.length}
              </span>
              <hr className="border-foreground/10 flex-1" />
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-4 lg:grid-cols-5">
              {editions.map(manifestation => (
                <EditionsSelectModalItem
                  key={manifestation.pid}
                  manifestation={manifestation}
                  name={EDITION_CHOICE_GROUP}
                  checked={selectedPid === manifestation.pid}
                  onSelect={() => setDraftChoice({ pid: manifestation.pid })}
                />
              ))}
            </div>
          </>
        )}

        {editions.length === 0 && (
          <p className="text-typo-caption mt-8">Ingen udgaver for denne materialetype.</p>
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
