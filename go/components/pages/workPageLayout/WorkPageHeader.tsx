"use client"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useOptimistic, useRef, useState, useTransition } from "react"

import {
  getManifestationLanguageCode,
  slideSelectOptionsFromMaterialTypes,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import WorkAuthors from "@/components/shared/authors/Authors"
import { Badge } from "@/components/shared/badge/Badge"
import { useIsBlueTitle } from "@/components/shared/badge/BlueTitleBadge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import { getEditionLabel } from "@/components/shared/editionsSelectModal/editionChoice"
import Icon from "@/components/shared/icon/Icon"
import MaterialTypeSelect, {
  MaterialTypeSelectOption,
} from "@/components/shared/materialTypeSelect/MaterialTypeSelect"
import PillButton from "@/components/shared/pillButton/PillButton"
import { useRestoreFocusAfterDialog } from "@/hooks/useRestoreFocusAfterDialog"
import useSession from "@/hooks/useSession"
import { useShownEditions } from "@/hooks/useShownEditions"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { hasCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { openModal } from "@/store/modal.store"

import WorkPageButtonsLoggedIn from "./WorkPageButtonsLoggedIn"
import WorkPageButtonsLoggedOut from "./WorkPageButtonsLoggedOut"

// Animates the press and hover.
const MotionPillButton = motion.create(PillButton)

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: ManifestationWorkPageFragment
  manifestations: ManifestationWorkPageFragment[]
}

const WorkPageHeader = ({ manifestations, work, selectedManifestation }: WorkPageHeaderProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const languageCode = getManifestationLanguageCode(selectedManifestation)

  const sortedManifestations = sortManifestationsBySortPriority(manifestations)

  // get the material types from the manifestations
  const materialTypes = sortedManifestations.map(manifestation => {
    return manifestation.materialTypes[0].materialTypeSpecific
  })

  const workMaterialTypesWithDisplayName = slideSelectOptionsFromMaterialTypes(materialTypes)

  const covers = selectedManifestation.cover

  const onOptionSelect = (optionSelected: MaterialTypeSelectOption) => {
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

  const isSelectedManifestationBlue = useIsBlueTitle(selectedManifestation)

  const { session } = useSession()
  const isLoggedIn = session?.isLoggedIn || false

  const urlMaterialTypeCode = searchParams.get("type")
  // An unknown url type never resolves, so it is not a switch in progress.
  const isUrlMaterialTypeKnown = materialTypeOptions.some(
    option => option.code === urlMaterialTypeCode
  )
  const isSwitchingMaterialType =
    (isUrlMaterialTypeKnown && urlMaterialTypeCode !== selectedManifestationMaterialTypeCode) ||
    pickedMaterialTypeCode !== selectedManifestationMaterialTypeCode

  const editionChoiceLabel = getEditionLabel(selectedManifestation)

  // Same set the picker lists, so it also decides whether the button shows.
  const { shownEditions, isLoadingAvailability } = useShownEditions(
    work.workId,
    pickedMaterialTypeCode
  )
  const hasEditionsToChooseFrom = shownEditions.length > 1
  const isEditionPickerLoading = isSwitchingMaterialType || isLoadingAvailability

  const editionButtonRef = useRef<HTMLButtonElement>(null)
  const shouldRestoreEditionFocus = useRef(false)
  // The nonce makes every choice a new value even when the sentence repeats,
  // which is what the live region below needs to announce it again.
  const [choiceAnnouncement, setChoiceAnnouncement] = useState({ text: "", nonce: 0 })
  const announceChoice = (text: string) =>
    setChoiceAnnouncement(current => ({ text, nonce: current.nonce + 1 }))

  // The picker opens through the modal store rather than a DialogTrigger, so
  // Radix has no element to hand the focus back to. This records the debt and
  // useRestoreFocusAfterDialog pays it once the dialog unmounts.
  const restoreEditionFocus = () => {
    shouldRestoreEditionFocus.current = true
  }

  useRestoreFocusAfterDialog(shouldRestoreEditionFocus, editionButtonRef)

  // The picker opens on the manifestation actually shown, whether it got
  // there by an explicit url pin or the page's own default pick; on confirm,
  // the picked pid becomes the url's edition param.
  const openEditionsSelect = () =>
    openModal("EditionsSelectModal", {
      wid: work.workId,
      materialTypeCode: pickedMaterialTypeCode,
      choicePid: selectedManifestation.pid,
      // The modal hands back the type it listed, so the pid and the type
      // always belong together.
      onChoiceConfirm: (pid: string, materialTypeCode: string) => {
        const url = resolveUrl({
          routeParams: { work: "work", wid: work.workId },
          queryParams: { type: materialTypeCode, edition: pid },
        })
        router.push(url, { scroll: false })
        // Named from the picked manifestation, which the page has not
        // selected yet.
        const picked = manifestations.find(manifestation => manifestation.pid === pid)
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
          {isSelectedManifestationBlue ? (
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          ) : null}
          {/* text-balance evens out the lines. */}
          <h1
            lang={languageCode}
            className="text-typo-heading-3 w-full text-balance break-words hyphens-auto lg:mt-0">
            {selectedManifestation?.titles?.main[0] ?? selectedManifestation?.titles?.full[0] ?? ""}
          </h1>
          {/* A work without named creators falls back to the edition's
              contributors — an anthology, say, credited to its editor. */}
          <WorkAuthors
            creators={
              hasCreators(work.creators) ? work.creators : selectedManifestation.contributors
            }
          />
          <div className="mt-grid-gap-2 flex flex-wrap items-center gap-x-4 gap-y-3 lg:mt-8">
            <p className="text-typo-body-md text-foreground-muted flex items-center gap-2">
              <Icon name="editions" className="h-[0.9375rem] w-[0.9375rem] shrink-0" />
              {`Udgave: ${editionChoiceLabel}`}
            </p>
            {!isEditionPickerLoading && hasEditionsToChooseFrom && (
              <MotionPillButton
                ref={editionButtonRef}
                aria-label="Skift udgave"
                onClick={openEditionsSelect}
                whileTap={{ scale: 0.92 }}
                whileHover={{ scale: 1.06 }}
                classNames="bg-background-overlay text-foreground-muted">
                <Icon name="switch" className="h-[14px] w-[14px] shrink-0" />
                <span>Skift</span>
              </MotionPillButton>
            )}
          </div>
        </div>
        <div
          className="mt-grid-gap-2 col-span-4 flex flex-col items-end justify-end lg:order-3
            lg:mt-0">
          {/* The edition picker closes on confirm, so the choice it made is
              announced here instead. Keyed by the nonce, so a repeated
              sentence still replaces the node and counts as a change. */}
          <p key={choiceAnnouncement.nonce} role="status" className="sr-only">
            {choiceAnnouncement.text}
          </p>
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
