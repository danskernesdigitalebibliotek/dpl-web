"use client"

import { useDigitalLoanDecisions } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useInView } from "framer-motion"
import React, { useRef } from "react"

import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getLoanDecisionMaterialIds, isManifestationCostFree } from "@/lib/helpers/helper.costFree"

import WorkCard, { TWorkCardProps } from "./WorkCard"
import { getWorkCardMaterialTypes } from "./helper"

type TWorkCardContainerProps = Omit<TWorkCardProps, "materialTypes" | "isBlueTitle" | "ref"> & {
  manifestations: ManifestationSearchPageTeaserFragment[]
}

// Feeds the work card with the loan decisions that say which material types
// are cost-free, asked for once the card is in view. A work with any
// cost-free material type is a "BLÅ" title.
const WorkCardContainer = ({ manifestations, ...props }: TWorkCardContainerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const { decisions } = useDigitalLoanDecisions(
    isInView ? getLoanDecisionMaterialIds(manifestations) : []
  )

  const materialTypes = getWorkCardMaterialTypes(manifestations, manifestation =>
    isManifestationCostFree(manifestation, decisions)
  )

  return (
    <WorkCard
      ref={ref}
      materialTypes={materialTypes}
      isBlueTitle={materialTypes.some(materialType => materialType.isCostFree)}
      {...props}
    />
  )
}

export default WorkCardContainer
