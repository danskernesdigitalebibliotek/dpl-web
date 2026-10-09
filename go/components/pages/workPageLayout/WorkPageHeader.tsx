"use client"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useOptimistic, useRef, useState, useTransition } from "react"

import {
  getManifestationLanguageCode,
  slideSelectOptionsFromMaterialTypes,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import WorkAuthors from "@/components/shared/authors/Authors"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import {
  DEFAULT_EDITION_CHOICE,
  type TEditionChoice,
  getEditionChoiceLabel,
  parseEditionChoice,
  serializeEditionChoice,
} from "@/components/shared/editionsSelectModal/editionChoice"
import MaterialTypeSelect, {
  MaterialTypeSelectOption,
} from "@/components/shared/materialTypeSelect/MaterialTypeSelect"
import { useRestoreFocusAfterDialog } from "@/hooks/useRestoreFocusAfterDialog"
import useSession from "@/hooks/useSession"
import { useShownEditions } from "@/hooks/useShownEditions"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { hasCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetV1ProductsIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { openModal } from "@/store/modal.store"

import WorkPageButtons from "./WorkPageButtons"
import WorkPageButtonsLoggedIn from "./WorkPageButtonsLoggedIn"
import WorkPageButtonsLoggedOut from "./WorkPageButtonsLoggedOut"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: ManifestationWorkPageFragment
  manifestations: ManifestationWorkPageFragment[]
}

const WorkPageHeader = ({ manifestations, work, selectedManifestation }: WorkPageHeaderProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedManifestationIsbns = selectedManifestation
    ? getIsbnsFromManifestation(selectedManifestation)
    : []
  const languageCode = getManifestationLanguageCode(selectedManifestation)

  const sortedManifestations = sortManifestationsBySortPriority(manifestations)

  // get the material types from the manifestations
  const materialTypes = sortedManifestations.map(manifestation => {
    return manifestation.materialTypes[0].materialTypeSpecific
  })

  const workMaterialTypesWithDisplayName = slideSelectOptionsFromMaterialTypes(materialTypes)

  const { data: publizonData } = useGetV1ProductsIdentifierAdapter(
    selectedManifestationIsbns?.[0],
    {
      // Publizon / useGetV1ProductsIdentifier is responsible for online
      // materials. It requires an ISBN to do lookups.
      // If the manifestation is physical, we skip the request
      query: {
        enabled:
          selectedManifestationIsbns.length > 0 &&
          selectedManifestation.accessTypes[0].code === "ONLINE",
      },
    }
  )

  const covers = selectedManifestation.cover

  const onOptionSelect = (optionSelected: MaterialTypeSelectOption) => {
    // The url carries only the new type, with no edition param.
    const url = resolveUrl({
      routeParams: { work: "work", wid: work.workId },
      queryParams: { type: optionSelected.code },
    })
    startTransition(() => {
      setPickedMaterialTypeCode(optionSelected.code)
      router.push(url, { scroll: false })
    })
  }

  const materialTypeOptions = workMaterialTypesWithDisplayName

  const selectedManifestationMaterialTypeCode =
    selectedManifestation?.materialTypes[0].materialTypeSpecific.code

  // The tapped type, correct immediately. The url and the selected
  // manifestation both lag until the transition below commits.
  const [pickedMaterialTypeCode, setPickedMaterialTypeCode] = useOptimistic(
    selectedManifestationMaterialTypeCode
  )
  const [, startTransition] = useTransition()

  const manifestationKey = selectedManifestation?.pid

  const isSelectedManifestationPodcast = selectedManifestationMaterialTypeCode === "PODCAST"

  const isSelectedManifestationCostFree = !!publizonData?.product?.costFree

  const { session } = useSession()
  const isLoggedIn = session?.isLoggedIn || false

  const urlMaterialTypeCode = searchParams.get("type")
  // A url type the work does not have never resolves to a manifestation, so
  // it does not count as a switch in progress.
  const isUrlMaterialTypeKnown = materialTypeOptions.some(
    option => option.code === urlMaterialTypeCode
  )
  const isSwitchingMaterialType =
    (isUrlMaterialTypeKnown && urlMaterialTypeCode !== selectedManifestationMaterialTypeCode) ||
    pickedMaterialTypeCode !== selectedManifestationMaterialTypeCode

  // The choice lives in the url, so the button label follows the chosen manifestation
  const urlEditionChoice = parseEditionChoice(searchParams.get("edition"))

  // Fallback to the default edition choice if the url edition choice is for a different manifestation than the selected one.
  const editionChoice =
    typeof urlEditionChoice === "object" && urlEditionChoice.pid !== selectedManifestation.pid
      ? DEFAULT_EDITION_CHOICE
      : urlEditionChoice

  const editionChoiceLabel = getEditionChoiceLabel(editionChoice, selectedManifestation)

  // The picker lists the editions of the picked type that the kommune can
  // supply, so the same set decides whether there is anything to pick between.
  const { shownEditions, isLoadingAvailability } = useShownEditions(
    work.workId,
    pickedMaterialTypeCode
  )
  const hasEditionsToChooseFrom = shownEditions.length > 1
  const isEditionPickerLoading = isSwitchingMaterialType || isLoadingAvailability

  const editionButtonRef = useRef<HTMLButtonElement>(null)
  // Set whenever focus is owed back to the edition button: the picker closed,
  // or a material-type switch replaced the button with a skeleton and dropped
  // focus onto <body>. `useRestoreFocusAfterDialog` pays it once no dialog
  // holds the focus trap and the button is mounted again.
  const shouldRestoreEditionFocus = useRef(false)
  // The nonce makes every choice a new value even when the sentence repeats,
  // which is what the live region below needs to announce it again.
  const [choiceAnnouncement, setChoiceAnnouncement] = useState({ text: "", nonce: 0 })
  const announceChoice = (text: string) =>
    setChoiceAnnouncement(current => ({ text, nonce: current.nonce + 1 }))

  // A material-type switch replaces the button with a skeleton, dropping
  // focus onto <body>. Only a switch that took the focus away owes it back;
  // one the reader started elsewhere leaves their focus alone. The hook below
  // pays the debt.
  useEffect(() => {
    if (!isEditionPickerLoading) return
    shouldRestoreEditionFocus.current ||= document.activeElement === document.body
  }, [isEditionPickerLoading])

  // The picker renders outside this tree, so it cannot return focus itself.
  // Only records the debt: the dialog's focus trap holds the focus until it
  // unmounts, so `useRestoreFocusAfterDialog` waits for that before moving
  // it.
  const restoreEditionFocus = () => {
    shouldRestoreEditionFocus.current = true
  }

  useRestoreFocusAfterDialog(shouldRestoreEditionFocus, editionButtonRef)

  // The modal receives the choice pinned to the selected manifestation; on
  // confirm, the choice is serialized back into the url's edition param.
  const openEditionsSelect = () =>
    openModal("EditionsSelectModal", {
      wid: work.workId,
      materialTypeCode: pickedMaterialTypeCode,
      choice: editionChoice,
      // The modal hands back the type it listed, so the pid and the type
      // always belong together.
      onChoiceConfirm: (choice: TEditionChoice, materialTypeCode: string) => {
        const editionParam = serializeEditionChoice(choice)
        const url = resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: {
            type: materialTypeCode,
            // "newest" is the default pick, so it needs no param of its own.
            ...(editionParam ? { edition: editionParam } : {}),
          },
        })
        router.push(url, { scroll: false })
        // The modal closes on confirm and the buttons behind it change state,
        // none of which a screen reader would otherwise report.
        if (choice === "newest") {
          announceChoice("Nyeste udgave valgt")
          return
        }
        // Named from the picked manifestation, not the selected one: the page
        // has not swapped it yet at this point.
        const picked = manifestations.find(manifestation => manifestation.pid === choice.pid)
        const pickedYear = picked?.edition?.publicationYear?.year
        announceChoice(pickedYear ? `Udgave valgt: ${pickedYear}` : "Udgave valgt")
      },
      onClosed: restoreEditionFocus,
    })

  return (
    <>
      <motion.div
        key={work.workId}
        className="lg:grid-go w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        exit={{ opacity: 0 }}>
        <div className="[container-type:inline-size] col-span-4 h-auto lg:order-2">
          {/* Fixed hero height: the viewport minus the site header, material
              select, title and actions (~35rem stacked, ~22rem in the lg
              column layout), floored — and never taller than the column is
              wide (100cqw), since a cover can't use more height than that.
              The layout stays stable across covers; the image scales inside
              and sits on the box bottom. */}
          <motion.div
            key={manifestationKey}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="rounded-base flex h-[min(max(9rem,calc(100dvh-35rem)),100cqw)] w-full
              lg:h-[min(max(16rem,calc(100dvh-22rem)),100cqw)]">
            {covers && (
              <CoverPicture
                withTilt={true}
                alt="Forsidebillede på værket"
                covers={covers}
                className="items-end"
              />
            )}
          </motion.div>
          {materialTypeOptions && (
            <div className="flex w-full justify-center pt-6">
              <MaterialTypeSelect
                options={materialTypeOptions}
                selected={pickedMaterialTypeCode}
                onOptionSelect={onOptionSelect}
              />
            </div>
          )}
        </div>
        <div className="col-span-4 flex flex-col items-start justify-end pt-4 lg:pt-0">
          {isSelectedManifestationCostFree || isSelectedManifestationPodcast ? (
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          ) : null}
          <h1 lang={languageCode} className="text-typo-heading-3 break-words hyphens-auto lg:mt-0">
            {selectedManifestation?.titles?.full || ""}
          </h1>
          {/* A work without named creators falls back to the edition's
              contributors — an anthology, say, credited to its editor. */}
          <WorkAuthors
            creators={
              hasCreators(work.creators) ? work.creators : selectedManifestation.contributors
            }
          />
        </div>
        <div className="col-span-4 mt-4 flex flex-col items-end justify-end lg:order-3 lg:mt-0">
          {/* The edition picker closes on confirm, so the choice it made is
              announced here instead. Keyed by the nonce, so a repeated
              sentence still replaces the node and counts as a change. */}
          <p key={choiceAnnouncement.nonce} role="status" className="sr-only">
            {choiceAnnouncement.text}
          </p>
          {/* Fewer than two obtainable editions is no choice, so the picker
              is left out entirely for such a material type. */}
          {(isEditionPickerLoading || hasEditionsToChooseFrom) && (
            <div className="mb-3 w-full">
              <WorkPageButtons>
                {/* Mid-switch the label would name the previous type's
                    edition, so a skeleton stands in until the page resolves
                    the new one — and until availability says whether the
                    button belongs here at all. */}
                {isEditionPickerLoading ? (
                  <div
                    role="status"
                    aria-label="Henter udgaver"
                    className="bg-background-skeleton h-12 w-full animate-pulse rounded-full
                      lg:max-w-80 lg:min-w-72"
                  />
                ) : (
                  <button
                    type="button"
                    ref={editionButtonRef}
                    onClick={openEditionsSelect}
                    aria-label={`Udgave: ${editionChoiceLabel}. Skift udgave`}
                    className="border-foreground/10 focus-visible text-typo-body-sm
                      hover:bg-background-overlay flex w-full items-center justify-between gap-3
                      rounded-full border px-5 py-3 text-left transition-colors lg:max-w-80
                      lg:min-w-72">
                    <span className="min-w-0 truncate">
                      {"Udgave: "}
                      <span className="font-semibold">{editionChoiceLabel}</span>
                    </span>
                    <span className="animate-text-underline shrink-0">Skift</span>
                  </button>
                )}
              </WorkPageButtons>
            </div>
          )}
          {isLoggedIn ? (
            <WorkPageButtonsLoggedIn
              workId={work.workId}
              selectedManifestation={selectedManifestation}
            />
          ) : (
            <WorkPageButtonsLoggedOut
              workId={work.workId}
              selectedManifestation={selectedManifestation}
            />
          )}
        </div>
      </motion.div>
    </>
  )
}

export default WorkPageHeader
