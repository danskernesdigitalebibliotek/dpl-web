"use client"

import { motion } from "framer-motion"
import { useRouter, useSearchParams } from "next/navigation"
import React, { useEffect, useState } from "react"

import WorkPageButtons from "@/components/pages/workPageLayout/WorkPageButtons"
import {
  addMaterialTypeIconToSelectOption,
  findInitialSliderValue,
  getManifestationByMaterialType,
  getManifestationLanguageIsoCode,
  getWorkMaterialTypes,
  translateMaterialTypesForRender,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/covers"
import { displayCreators } from "@/lib/helpers/helper.creators"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useGetV1ProductsIdentifier } from "@/lib/rest/publizon-api/generated/publizon"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
}

const WorkPageHeader = ({ work }: WorkPageHeaderProps) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { selectedManifestation, setSelectedManifestation } = useSelectedManifestationStore()
  const [slideSelectOptions, setSlideSelectOptions] = useState<SlideSelectOption[] | null>(null)
  const isbns = selectedManifestation ? getIsbnsFromManifestation(selectedManifestation) : []
  const languageIsoCode = getManifestationLanguageIsoCode(selectedManifestation)
  const titleSuffix = selectedManifestation?.titles?.identifyingAddition || ""
  const [initialSliderValue, setInitialSliderValue] = useState<SlideSelectOption | undefined>(
    undefined
  )
  const workMaterialTypes = getWorkMaterialTypes(work.materialTypes).map(materialType => {
    return { value: materialType.code, render: materialType.display }
  })

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
    const params = new URLSearchParams(searchParams)
    params.set("type", optionSelected.render)
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false })
  }

  useEffect(() => {
    // Initialize slideSelect options
    const slideSelectOptions = workMaterialTypes.reduce<SlideSelectOption[]>(
      (acc, materialType) => {
        // We only want unique material types
        if (!acc.some(item => item.value === materialType.value)) {
          acc.push(translateMaterialTypesForRender(addMaterialTypeIconToSelectOption(materialType)))
        }
        return acc
      },
      []
    )
    setSlideSelectOptions(slideSelectOptions)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Initialize slideSelect initial value
    const searchParams = new URLSearchParams(window.location.search)
    setInitialSliderValue(
      findInitialSliderValue(slideSelectOptions, selectedManifestation, searchParams)
    )
  }, [selectedManifestation, slideSelectOptions])

  useEffect(() => {
    if (!!searchParams.get("type")) {
      setSelectedManifestation(
        getManifestationByMaterialType(work, searchParams.get("type") as string) ||
          selectedManifestation
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

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
                options={slideSelectOptions}
                initialOption={initialSliderValue}
                onOptionSelect={onOptionSelect}
              />
            </div>
          )}
        </div>
        <div className="col-span-4 flex flex-col items-start justify-end pt-grid-gap-3 lg:pt-0">
          {!!publizonData?.product?.costFree && (
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          )}
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
          <WorkPageButtons workId={work.workId} />
        </div>
      </motion.div>
    </>
  )
}

export default WorkPageHeader
