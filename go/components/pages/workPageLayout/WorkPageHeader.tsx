import React from "react"

import { Button } from "@/components/shared/button/Button"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import { displayCreators } from "@/components/shared/workCard/helper"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/covers"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

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
  const slideSelectOptions = getWorkMaterialTypes(work).map(materialType => {
    return { value: materialType.code, render: materialType.display }
  })
  const titleSuffix = selectedManifestation?.titles?.identifyingAddition
  const lowResCover = getLowResCoverUrl(dataCovers)
  const coverSrc = getCoverUrls(
    dataCovers,
    [selectedManifestation?.pid || ""],
    ["default", "original", "large", "medium-large", "medium", "small-medium", "small", "xx-small"]
  )

  return (
    <div className="mt-5 flex w-full flex-col lg:flex-row">
      <div className="h-auto lg:order-2 lg:flex lg:flex-1 lg:basis-1/3 lg:flex-col">
        <div className="relative mx-auto flex h-full w-[70vw] items-stretch justify-center lg:w-full">
          {!isLoadingCovers && (
            <CoverPicture
              alt="Forsidebillede på værket"
              lowResSrc={lowResCover || ""}
              src={coverSrc?.[0] || ""}
            />
          )}
        </div>
        <div className="flex w-full justify-center">
          <SlideSelect
            options={slideSelectOptions}
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
        <Button ariaLabel="button" size={"default"} className="min-w-full lg:min-w-80">
          NOT DONE (PRØV)
        </Button>
        <Button ariaLabel="button" size={"default"} className="min-w-full lg:min-w-80">
          NOT DONE (LYT / LÆS)
        </Button>
      </div>
    </div>
  )
}

export default WorkPageHeader
