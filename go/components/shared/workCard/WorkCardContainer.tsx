"use client"

import {
  isCostFreeLoan,
  useDigitalLoanDecisions,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useInView } from "framer-motion"
import React, { useRef } from "react"

import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"

import WorkCard, { TWorkCardProps } from "./WorkCard"
import { getWorkCardMaterialTypes } from "./helper"

type TWorkCardContainerProps = Omit<TWorkCardProps, "materialTypes" | "isBlueTitle" | "ref"> & {
  manifestations: ManifestationSearchPageTeaserFragment[]
}

// Feeds the work card with the loan decisions that say which material types
// are cost-free, asked for once the card is in view. A work with any
// cost-free material type is a "BLÅ" title. The decision is patron-scoped,
// so a reader without a borrowing session sees no BLÅ badge.
const WorkCardContainer = ({ manifestations, ...props }: TWorkCardContainerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const materialIds = manifestations.map(manifestation =>
    manifestation.accessTypes[0]?.code === "ONLINE"
      ? (getPublizonIdentifierFromManifestation(manifestation) ?? null)
      : null
  )

  const { decisions } = useDigitalLoanDecisions(
    isInView ? materialIds.filter((id): id is string => !!id) : []
  )

  const materialTypes = getWorkCardMaterialTypes(manifestations, index => {
    const materialId = materialIds[index]
    return !!materialId && isCostFreeLoan(decisions[materialId]?.loanProvider)
  })

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
