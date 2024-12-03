import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"

import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import { displayCreators } from "@/components/shared/workCard/helper"
import { WorkFullWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/covers"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useGetV1ProductsIdentifier } from "@/lib/rest/publizon-api/generated/publizon"
import { useSelectedManifestationStore } from "@/store/selectedManifestation.store"

import WorkPageButtons from "./WorkPageButtons"
import {
  getIsbnsFromManifestation,
  getManifestationByMaterialType,
  getManifestationLanguageIsoCode,
  getWorkMaterialTypes,
} from "./helper"

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
  const isbns = getIsbnsFromManifestation(selectedManifestation)
  const isPublizonQueryEnabled = () => {
    return isbns && isbns.length > 0
  }
  const { data: dataPublizon } = useGetV1ProductsIdentifier(isbns[0]?.value || "", {
    query: {
      // Publizon / useGetV1ProductsIdentifier is responsible for online
      // materials. It requires an ISBN to do lookups.
      enabled: isPublizonQueryEnabled(),
    },
  })
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
  const languageIsoCode = getManifestationLanguageIsoCode(selectedManifestation)

  useEffect(() => {
    setinitialSliderValue(findInitialSliderValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedManifestation])

  return (
    <>
      <motion.div
        key={work.workId}
        className="lg:grid-go mt-5"
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
          <div className="flex w-full justify-center pt-12">
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
        <div className="col-span-4 flex flex-col items-start justify-end pt-grid-gap-3 lg:pt-0">
          {!!dataPublizon?.product?.costFree && (
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          )}
          <h1
            lang={languageIsoCode}
            className="hyphens-auto break-words text-typo-heading-3 lg:mt-0 lg:text-typo-heading-2">
            {`${selectedManifestation?.titles?.full || ""}${!!titleSuffix ? ` (${titleSuffix})` : ""}`}
          </h1>
          <p className="mt-grid-gap-2 text-typo-caption uppercase lg:mt-7">{`af ${displayCreators(work.creators, 100)}`}</p>
        </div>
        <div className="col-span-4 mt-grid-gap-3 flex flex-col items-end justify-end lg:order-3 lg:mt-0">
          <WorkPageButtons workId={work.workId} />
        </div>
      </motion.div>
    </>
  )
}

export default WorkPageHeader
