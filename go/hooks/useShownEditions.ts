"use client"

import { useMemo } from "react"

import {
  getEditionsForMaterialType,
  isPhysicalMaterialType,
} from "@/components/pages/workPageLayout/helper"
import {
  ManifestationWorkPageFragment,
  useGetMaterialQuery,
} from "@/lib/graphql/generated/fbi/graphql"

import { useEditionAvailability } from "./useEditionAvailability"

// The editions of one material type the reader can actually choose between:
// the kommune's unobtainable ones are left out, lent-out ones stay.
// See docs/go/material-availability.md
export const useShownEditions = (wid: string, materialTypeCode: string) => {
  const { data } = useGetMaterialQuery({ wid }, { enabled: !!wid })
  const allManifestations = data?.work?.manifestations?.all

  const editions = useMemo(
    () =>
      getEditionsForMaterialType(
        (allManifestations ?? []) as ManifestationWorkPageFragment[],
        materialTypeCode
      ),
    [allManifestations, materialTypeCode]
  )

  const { isLoadingAvailability, isAvailabilityUnknown, isEditionHidden, isEditionLentOut } =
    useEditionAvailability(wid)

  // FBS is asked about every physical record of the work, so a work holding
  // both a book and an ebook keeps that request in flight while the reader is
  // on the ebook type — where its answer says nothing. Only a type that has
  // physical editions waits for it.
  const needsPhysicalAvailability = editions.some(manifestation =>
    isPhysicalMaterialType(manifestation.materialTypes[0]?.materialTypeSpecific.code)
  )

  // Ordering is untouched, so what remains keeps its position. A new array
  // each render — `isEditionHidden` closes over the availability data and is
  // rebuilt with it — so this does not belong in a dependency list.
  const shownEditions = editions.filter(manifestation => !isEditionHidden(manifestation))

  return {
    editions,
    shownEditions,
    isLoadingAvailability: needsPhysicalAvailability && isLoadingAvailability,
    isAvailabilityUnknown,
    isEditionLentOut,
  }
}
