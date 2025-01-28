"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import React from "react"

import WorkPageButtons from "@/components/pages/workPageLayout/WorkPageButtons"
import {
  getManifestationLanguageIsoCode,
  getWorkMaterialTypes,
  translateMaterialTypesStringForRender,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import goConfig from "@/lib/config/goConfig"
import {
  GeneralMaterialType,
  GeneralMaterialTypeCodeEnum,
  ManifestationWorkPageFragment,
  Work,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useGetV1ProductsIdentifier } from "@/lib/rest/publizon-api/generated/publizon"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: ManifestationWorkPageFragment
}

const slideSelectOptionsFromMaterialTypes = (workMaterialTypes: GeneralMaterialType[]) => {
  return workMaterialTypes.map(materialType => {
    return {
      code: materialType.code,
      display: translateMaterialTypesStringForRender(
        materialType.code as GeneralMaterialTypeCodeEnum
      ),
    }
  }) as SlideSelectOption[]
}

const WorkPageHeader = ({ work, selectedManifestation }: WorkPageHeaderProps) => {
  const router = useRouter()
  const isbns = selectedManifestation ? getIsbnsFromManifestation(selectedManifestation) : []
  const languageIsoCode = getManifestationLanguageIsoCode(selectedManifestation)
  const titleSuffix = selectedManifestation?.titles?.identifyingAddition || ""
  const workMaterialTypes = getWorkMaterialTypes(
    (work?.materialTypes as Work["materialTypes"]) || []
  )
  const workMaterialTypesWithDisplayName = slideSelectOptionsFromMaterialTypes(workMaterialTypes)

  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection(
    {
      type: "pid",
      // This is always a string - query is disabled when selectedManifestation is false-y
      identifiers: [selectedManifestation?.pid as string],
      sizes: [
        "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
      ],
    },
    { query: { enabled: !!selectedManifestation?.pid } }
  )

  const { data: publizonData } = useGetV1ProductsIdentifier(isbns?.[0], {
    query: {
      // Publizon / useGetV1ProductsIdentifier is responsible for online
      // materials. It requires an ISBN to do lookups.
      enabled: isbns.length > 0,
    },
  })

  const lowResCover = getLowResCoverUrl(dataCovers)
  const coverSrc = getCoverUrls(
    dataCovers,
    selectedManifestation?.pid ? [selectedManifestation.pid] : undefined,
    ["default", "original", "large", "medium-large", "medium", "small-medium", "small", "xx-small"]
  )
  const onOptionSelect = (optionSelected: SlideSelectOption) => {
    const url = resolveUrl({
      routeParams: { work: "work", wid: work.workId },
      queryParams: { type: optionSelected.code },
    })
    router.push(url, { scroll: false })
  }

  const slideSelectOptions = workMaterialTypesWithDisplayName

  // sort the slideSelectOptions by GeneralMaterialTypeCodeEnum
  const sortedSlideSelectOptions = slideSelectOptions.sort((a, b) => {
    // sort by the index of the GeneralMaterialTypeCodeEnum in the materialTypeSortPriority array
    return (
      goConfig("materialtypes.sortpriority").indexOf(a.code) -
      goConfig("materialtypes.sortpriority").indexOf(b.code)
    )
  })

  const selectedManifestationMaterialTypeCode = selectedManifestation?.materialTypes[0]
    .materialTypeGeneral.code as GeneralMaterialTypeCodeEnum

  const isSelectedManifestationPodcast =
    selectedManifestationMaterialTypeCode === "PODCASTS" || false

  return (
    <>
      <motion.div
        key={work.workId}
        className="lg:grid-go mt-5 lg:mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        exit={{ opacity: 0 }}>
        <div className="col-span-4 h-auto lg:order-2">
          <div className="flex aspect-1/1 h-auto w-full flex-col items-center justify-center rounded-base lg:aspect-4/5">
            {!isLoadingCovers && (
              <CoverPicture
                alt="Forsidebillede på værket"
                lowResSrc={lowResCover || ""}
                src={coverSrc?.[0] || ""}
              />
            )}
          </div>
          {slideSelectOptions && (
            <div className="flex w-full justify-center pt-12">
              <SlideSelect
                options={sortedSlideSelectOptions}
                selected={selectedManifestationMaterialTypeCode}
                onOptionSelect={onOptionSelect}
              />
            </div>
          )}
        </div>
        <div className="col-span-4 flex flex-col items-start justify-end pt-grid-gap-3 lg:pt-0">
          {!!publizonData?.product?.costFree || isSelectedManifestationPodcast ? (
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          ) : null}
          <h1
            lang={languageIsoCode}
            className="hyphens-auto break-words text-typo-heading-3 lg:mt-0 lg:text-typo-heading-2">
            {`${selectedManifestation?.titles?.full || ""}${!!titleSuffix ? ` (${titleSuffix})` : ""}`}
          </h1>
          <h2 className="mt-grid-gap-2 text-typo-subtitle-sm uppercase lg:mt-7">
            {`af ${displayCreators(work.creators, 100) || displayCreators(selectedManifestation?.contributors || [], 100)}`}
          </h2>
        </div>
        <div className="col-span-4 mt-grid-gap-3 flex flex-col items-end justify-end lg:order-3 lg:mt-0">
          <WorkPageButtons workId={work.workId} selectedManifestation={selectedManifestation} />
        </div>
      </motion.div>
    </>
  )
}

export default WorkPageHeader
