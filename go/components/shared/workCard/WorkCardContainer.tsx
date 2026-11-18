"use client"

import { useQueries } from "@tanstack/react-query"
import { useInView } from "framer-motion"
import React, { useRef } from "react"

import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import {
  getGetV1ProductsIdentifierAdapterQueryKey,
  getV1ProductsIdentifierAdapter,
} from "@/lib/rest/publizon/adapter/generated/publizon"

import WorkCard, { TWorkCardProps } from "./WorkCard"
import { getWorkCardMaterialTypes } from "./helper"

type TWorkCardContainerProps = Omit<TWorkCardProps, "materialTypes" | "isBlueTitle" | "ref"> & {
  manifestations: ManifestationSearchPageTeaserFragment[]
}

// Feeds the work card with Publizon data, looked up once the card is in view,
// to know which material types are cost-free. A work with any cost-free
// material type is a "BLÅ" title.
const WorkCardContainer = ({ manifestations, ...props }: TWorkCardContainerProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true })

  const materialTypes = useQueries({
    queries: manifestations.map(item => {
      const isbn = item.identifiers.find(identifier => identifier.type === "ISBN")?.value || ""

      return {
        queryKey: getGetV1ProductsIdentifierAdapterQueryKey(isbn),
        queryFn: () => getV1ProductsIdentifierAdapter(isbn),
        enabled: isInView && item.accessTypes[0].code === "ONLINE",
      }
    }),
    combine: results =>
      getWorkCardMaterialTypes(manifestations, index =>
        Boolean(results[index].data?.product?.costFree)
      ),
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
