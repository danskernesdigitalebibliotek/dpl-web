"use client"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import React, { useEffect, useMemo, useState } from "react"

import {
  getEditionsForMaterialType,
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
} from "@/components/shared/editionsSelectModal/EditionsSelectModal"
import MaterialTypeSelect, {
  MaterialTypeSelectOption,
} from "@/components/shared/materialTypeSelect/MaterialTypeSelect"
import useSession from "@/hooks/useSession"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetV1ProductsIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import { openModal } from "@/store/modal.store"

import WorkPageButton from "./WorkPageButton"
import WorkPageButtonsLoggedIn from "./WorkPageButtonsLoggedIn"
import WorkPageButtonsLoggedOut from "./WorkPageButtonsLoggedOut"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: ManifestationWorkPageFragment
  manifestations: ManifestationWorkPageFragment[]
}

const WorkPageHeader = ({ manifestations, work, selectedManifestation }: WorkPageHeaderProps) => {
  const router = useRouter()
  const [editionChoice, setEditionChoice] = useState<TEditionChoice>(DEFAULT_EDITION_CHOICE)
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
    const url = resolveUrl({
      routeParams: { work: "work", wid: work.workId },
      queryParams: { type: optionSelected.code },
    })
    router.push(url, { scroll: false })
  }

  const materialTypeOptions = workMaterialTypesWithDisplayName

  const selectedManifestationMaterialTypeCode =
    selectedManifestation?.materialTypes[0].materialTypeSpecific.code

  const manifestationKey = selectedManifestation?.pid

  const isSelectedManifestationPodcast = selectedManifestationMaterialTypeCode === "PODCAST"

  const isSelectedManifestationCostFree = !!publizonData?.product?.costFree

  const { session } = useSession()
  const isLoggedIn = session?.isLoggedIn || false

  // Same cached query EditionsSelectModal reads, so the trigger button can label the
  // pinned edition without the picker being open.
  const { data: materialData } = useGetMaterialQuery(
    { wid: work.workId },
    { enabled: !!work.workId }
  )
  const editions = useMemo(
    () =>
      getEditionsForMaterialType(
        (materialData?.work?.manifestations?.all ?? []) as ManifestationWorkPageFragment[],
        selectedManifestationMaterialTypeCode
      ),
    [materialData, selectedManifestationMaterialTypeCode]
  )

  //Reset the edition choice to the default when the selected manifestation material type changes
  useEffect(() => {
    setEditionChoice(DEFAULT_EDITION_CHOICE)
  }, [selectedManifestationMaterialTypeCode])

  const editionChoiceLabel = getEditionChoiceLabel(editionChoice, editions)

  // The modal is rendered by the DynamicModal host, so the current choice is
  // handed over as the initial selection and comes back on confirm.
  const openEditionsSelect = () =>
    openModal("EditionsSelectModal", {
      wid: work.workId,
      materialTypeCode: selectedManifestationMaterialTypeCode,
      choice: editionChoice,
      onChoiceConfirm: setEditionChoice,
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
                selected={selectedManifestationMaterialTypeCode}
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
          <div className="mb-3 flex w-full lg:items-end">
            <WorkPageButton ariaLabel="Vælg udgave" onClick={openEditionsSelect}>
              {`Udgave: ${editionChoiceLabel}`}
            </WorkPageButton>
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
