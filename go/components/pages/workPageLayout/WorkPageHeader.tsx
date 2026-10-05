"use client"
import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useOptimistic, useTransition } from "react"

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
import useSession from "@/hooks/useSession"
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
      },
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
          <div className="mb-3 w-full">
            <WorkPageButtons>
              {/* Mid-switch the label would still name the previous type's
                  edition, so the button is replaced by a skeleton until the
                  page has resolved the new one. */}
              {isSwitchingMaterialType ? (
                <div
                  className="bg-background-skeleton h-12 w-full animate-pulse rounded-full
                    lg:max-w-80 lg:min-w-72"
                />
              ) : (
                <button
                  type="button"
                  onClick={openEditionsSelect}
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
