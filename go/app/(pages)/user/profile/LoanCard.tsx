"use client"

import { differenceInDays } from "date-fns"
import { useEffect } from "react"

import {
  getManifestationMaterialTypeIcon,
  isAudioMaterialType,
  isEbookMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture, CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import useLoanThresholds from "@/hooks/useLoanThresholds"
import { ManifestationSearchPageTeaserFragment } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { useGetV1ProductsIdentifierAdapter } from "@/lib/rest/publizon/adapter/generated/publizon"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type LoanCardProps = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  className?: string
  setAudioLoans: React.Dispatch<React.SetStateAction<string[]>>
  setEbookLoans: React.Dispatch<React.SetStateAction<string[]>>
}

// Digital loans aren't returned by the user — the loan period just runs out —
// so the label stays "Udløber", but the due-soon coloring follows the same
// thresholds as physical loans.
const expiryStatusText = (daysUntil: number, danger: number) => {
  if (daysUntil <= danger) {
    return "Udløber i dag"
  }
  return `Udløber om ${daysUntil} ${daysUntil === 1 ? "dag" : "dage"}`
}

const LoanCard = ({
  manifestation,
  title,
  className,
  setAudioLoans,
  setEbookLoans,
}: LoanCardProps) => {
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()

  const manifestationIsbn = manifestation.identifiers.find(
    identifier => identifier.type === "ISBN"
  )?.value
  const { data: dataProducts } = useGetV1ProductsIdentifierAdapter(manifestationIsbn || "")

  const loan = dataLoans?.loans?.find(loan => loan.libraryBook?.identifier === manifestationIsbn)
  const targetDate = new Date(loan?.loanExpireDateUtc || "")
  const today = new Date()
  const daysUntil = differenceInDays(targetDate, today)
  const { warning, danger } = useLoanThresholds()
  const isExpiringNow = daysUntil <= danger
  const isExpiringSoon = !isExpiringNow && daysUntil <= warning

  const materialTypeCode = manifestation.materialTypes[0]?.materialTypeSpecific.code

  const isCostFree = dataProducts?.product?.costFree || isPodcastMaterialType(materialTypeCode)

  useEffect(() => {
    // If products are not loaded yet, we don't want to set the loans
    if (!dataProducts?.product) {
      return
    }
    // TODO: Maybe we could move this logic to the parent component (?)
    if (!isCostFree) {
      if (isAudioMaterialType(materialTypeCode)) {
        setAudioLoans(prev =>
          prev.includes(String(manifestationIsbn))
            ? prev
            : [...prev, manifestationIsbn || "unknown isbn"]
        )
      }
      if (isEbookMaterialType(materialTypeCode)) {
        setEbookLoans(prev =>
          prev.includes(String(manifestationIsbn))
            ? prev
            : [...prev, manifestationIsbn || "unknown isbn"]
        )
      }
    }
    // We only want to run this useEffect if the manifestation changes or when the products are loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manifestation, isCostFree, dataProducts])

  if (isLoadingLoans) {
    return (
      <div className={cn("relative flex aspect-5/7 h-full w-full", className)}>
        <div className="aspect-1/1 h-full w-full p-14">
          <CoverPictureSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("relative flex aspect-5/7 h-full w-full", className)}>
      <div className="h-full w-full">
        <div className="block h-full w-full space-y-3 px-[15%]">
          <div className="relative h-[85%]">
            <CoverPicture
              covers={manifestation.cover}
              alt={`${title} cover billede`}
              withTilt={false}
              className="select-none"
            />
            <MaterialTypeIconWrapper
              iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
              className={cn(
                "relative z-10 mx-auto -mt-14 outline-1",
                isCostFree
                  ? "bg-content-blue-100 dark:text-blue-title-dark"
                  : "bg-background-overlay-solid"
              )}
              costFree={isCostFree}
            />
          </div>
          <p
            className={cn("text-typo-subtitle-sm w-full text-center break-words", {
              "text-error-red-400 dark:text-error-red-200": isExpiringNow,
              "text-warning-orange-400 dark:text-warning-orange-200": isExpiringSoon,
              "text-foreground-muted": !isExpiringNow && !isExpiringSoon,
            })}>
            {isExpiringNow && (
              <span
                className="bg-error-red-400 dark:bg-error-red-200 mr-2 inline-block h-2 w-2
                  rounded-full"
              />
            )}
            {expiryStatusText(daysUntil, danger)}
          </p>
          {isCostFree && (
            <div className="flex w-full justify-center">
              <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
                BLÅ
              </Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoanCard
