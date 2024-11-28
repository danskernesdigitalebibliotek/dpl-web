import React, { useEffect, useState } from "react"

import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import { displayCreators } from "@/components/shared/workCard/helper"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/covers"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import WorkPageButtons from "./WorkPageButtons"
import { getManifestationByMaterialType, getWorkMaterialTypes } from "./helper"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
}

const WorkPageHeader = ({ work }: WorkPageHeaderProps) => {
  const { selectedManifestation, setSelectedManifestation } = useSelectedManifestationStore()
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
  const workMaterialTypes = getWorkMaterialTypes(work).map(materialType => {
    return { value: materialType.code, render: materialType.display }
  })
  // We only want unique material types
  const slideSelectOptions = workMaterialTypes.reduce<SlideSelectOption[]>((acc, materialType) => {
    if (!acc.some(item => item.value === materialType.value)) {
      acc.push(materialType)
    }
    return acc
  }, [])
  const titleSuffix = selectedManifestation?.titles?.identifyingAddition
  const lowResCover = getLowResCoverUrl(dataCovers)
  const coverSrc = getCoverUrls(
    dataCovers,
    [selectedManifestation?.pid || ""],
    ["default", "original", "large", "medium-large", "medium", "small-medium", "small", "xx-small"]
  )
  const [initialSliderValue, setinitialSliderValue] = useState<SlideSelectOption | undefined>(
    undefined
  )
  const findInitialSliderValue = () => {
    return slideSelectOptions.find(option => {
      return selectedManifestation?.materialTypes.find(materialType => {
        return materialType.materialTypeGeneral.code.includes(option.value)
      })
    })
  }

  useEffect(() => {
    setinitialSliderValue(findInitialSliderValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManifestation])

  return (
    <>
      <div className="mt-5 flex w-full flex-col lg:flex-row">
        <div className="h-auto lg:order-2 lg:flex lg:flex-1 lg:basis-1/3 lg:flex-col">
          <div className="relative mx-auto mb-12 flex h-full w-[70vw] justify-center lg:min-h-[60vh] lg:w-full">
            {!isLoadingCovers && (
              <CoverPicture
                alt="Forsidebillede på værket"
                lowResSrc={lowResCover || ""}
                src={coverSrc?.[0] || ""}
                classNames="lg:w-[80%] select-none"
              />
            )}
          </div>
          <div className="flex w-full justify-center">
            <SlideSelect
              options={slideSelectOptions}
              initialOption={initialSliderValue}
              onOptionSelect={(optionSelected: SlideSelectOption) => {
                setSelectedManifestation(
                  getManifestationByMaterialType(work, optionSelected.value) ||
                    work.manifestations.bestRepresentation
                )
              }}
            />
          </div>
        </div>
        <div className="flex flex-col lg:order-1 lg:flex-1 lg:basis-1/3 lg:justify-end">
          <h1
            // In order to be able to break words, we need to set the lang attribute
            lang="da"
            className="mt-grid-gap-3 hyphens-auto break-words text-typo-heading-3 lg:mt-0 lg:text-typo-heading-2">
            {`${selectedManifestation?.titles?.main}${!!titleSuffix ? ` (${titleSuffix})` : ""}`}
          </h1>
          <p className="mt-grid-gap-2 text-typo-caption uppercase lg:mt-7">{`af ${displayCreators(work.creators, 100)}`}</p>
        </div>
        <div className="mt-grid-gap-3 flex flex-col items-end justify-end gap-3 lg:order-3 lg:flex-1 lg:basis-1/3">
          <WorkPageButtons workId={work.workId} />
        </div>
      </div>
    </>
  )
}

export default WorkPageHeader
