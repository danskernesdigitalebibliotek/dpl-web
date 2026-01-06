import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import React from "react"

import {
  getManifestationLanguageIsoCode,
  slideSelectOptionsFromMaterialTypes,
  sortManifestationsBySortPriority,
} from "@/components/pages/workPageLayout/helper"
import WorkAuthors from "@/components/shared/authors/Authors"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture } from "@/components/shared/coverPicture/CoverPicture"
import SlideSelect, { SlideSelectOption } from "@/components/shared/slideSelect/SlideSelect"
import useSession from "@/hooks/useSession"
import {
  ManifestationWorkPageFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { resolveUrl } from "@/lib/helpers/helper.routes"
import { getIsbnsFromManifestation } from "@/lib/helpers/ids"
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
  const selectedManifestationIsbns = selectedManifestation
    ? getIsbnsFromManifestation(selectedManifestation)
    : []
  const languageIsoCode = getManifestationLanguageIsoCode(selectedManifestation)
  const titleSuffix = selectedManifestation?.titles?.identifyingAddition || ""

  const sortedManifestations = sortManifestationsBySortPriority(manifestations)

  // get the material types from the manifestations
  const materialTypes = sortedManifestations.map(manifestation => {
    return manifestation.materialTypes[0].materialTypeGeneral
  })

  const workMaterialTypesWithDisplayName = slideSelectOptionsFromMaterialTypes(materialTypes)

  const { data: publizonData } = useGetV1ProductsIdentifierAdapter(
    selectedManifestationIsbns?.[0],
    {
      // Publizon / useGetV1ProductsIdentifier is responsible for online
      // materials. It requires an ISBN to do lookups.
      // If the manifestation is physical, we skip the request
      enabled:
        selectedManifestationIsbns.length > 0 &&
        selectedManifestation.accessTypes[0].code === "ONLINE",
    }
  )

  const covers = selectedManifestation.cover

  const onOptionSelect = (optionSelected: SlideSelectOption) => {
    const url = resolveUrl({
      routeParams: { work: "work", wid: work.workId },
      queryParams: { type: optionSelected.code },
    })
    router.push(url, { scroll: false })
  }

  const slideSelectOptions = workMaterialTypesWithDisplayName

  const selectedManifestationMaterialTypeCode =
    selectedManifestation?.materialTypes[0].materialTypeGeneral.code

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
          <div
            className="rounded-base flex aspect-1/1 h-auto w-full flex-col items-center
              justify-center lg:aspect-4/5">
            {covers && <CoverPicture alt="Forsidebillede på værket" covers={covers} />}
          </div>
          {slideSelectOptions && (
            <div className="flex w-full justify-center pt-12">
              <SlideSelect
                options={slideSelectOptions}
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
        <div
          className="mt-grid-gap-3 col-span-4 flex flex-col items-end justify-end lg:order-3
            lg:mt-0">
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
