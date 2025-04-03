import { motion } from "framer-motion"
import { uniqBy } from "lodash"
import { useRouter } from "next/navigation"
import React from "react"

import {
  getManifestationLanguageIsoCode,
  slideSelectOptionsFromMaterialTypes,
  sortSlideSelectOptions,
} from "@/components/pages/workPageLayout/helper"
import WorkAuthors from "@/components/shared/authors/Authors"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import useSession from "@/hooks/useSession"
import {
  GeneralMaterialTypeCodeEnum,
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import { useGetV1ProductsIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"

import WorkPageButtonsLoggedIn from "./WorkPageButtonsLoggedIn"
import WorkPageButtonsLoggedOut from "./WorkPageButtonsLoggedOut"

type WorkPageHeaderProps = {
  work: WorkFullWorkPageFragment
  selectedManifestation: ManifestationWorkPageFragment
  manifestations: ManifestationWorkPageFragment[]
}

const WorkPageHeader = ({ manifestations, work, selectedManifestation }: WorkPageHeaderProps) => {
  const router = useRouter()
  const isbns = selectedManifestation ? getIsbnsFromManifestation(selectedManifestation) : []
  const languageIsoCode = getManifestationLanguageIsoCode(selectedManifestation)
  const titleSuffix = selectedManifestation?.titles?.identifyingAddition || ""

  // get the material types from the manifestations
  const materialTypes = manifestations.map(manifestation => {
    return manifestation.materialTypes[0].materialTypeGeneral
  })

  const uniqueMaterialType = uniqBy(materialTypes, "materialTypeGeneral.code")
  const workMaterialTypesWithDisplayName = slideSelectOptionsFromMaterialTypes(uniqueMaterialType)

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

  const { data: publizonData } = useGetV1ProductsIdentifierAdapter(isbns?.[0], {
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
  const sortedSlideSelectOptions = sortSlideSelectOptions(slideSelectOptions)

  const selectedManifestationMaterialTypeCode = selectedManifestation?.materialTypes[0]
    .materialTypeGeneral.code as GeneralMaterialTypeCodeEnum

  const isSelectedManifestationPodcast =
    selectedManifestationMaterialTypeCode === "PODCASTS" || false

  const isSelectedManifestationCostFree = !!publizonData?.product?.costFree

  const { session } = useSession()
  const isLoggedIn = session?.isLoggedIn || false

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
          <div className="rounded-base flex aspect-1/1 h-auto w-full flex-col items-center justify-center lg:aspect-4/5">
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
        <div className="pt-grid-gap-3 col-span-4 flex flex-col items-start justify-end lg:pt-0">
          {isSelectedManifestationCostFree || isSelectedManifestationPodcast ? (
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          ) : null}
          <h1
            lang={languageIsoCode}
            className="text-typo-heading-3 break-words hyphens-auto lg:mt-0">
            {`${selectedManifestation?.titles?.full || ""}${!!titleSuffix ? ` (${titleSuffix})` : ""}`}
          </h1>
          <WorkAuthors creators={work.creators || selectedManifestation?.contributors} />
        </div>
        <div className="mt-grid-gap-3 col-span-4 flex flex-col items-end justify-end lg:order-3 lg:mt-0">
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
