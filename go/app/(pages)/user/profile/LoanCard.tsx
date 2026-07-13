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
import StatusLabel from "@/components/shared/statusLabel/StatusLabel"
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
  setBlueLoans: React.Dispatch<React.SetStateAction<string[]>>
}

// Digital loans aren't returned by the user — the loan period just runs out —
// so the label stays "Udløber", but the due-soon coloring follows the same
// thresholds as physical loans.
export const expiryStatusText = (daysUntil: number, danger: number) => {
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
  setBlueLoans,
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
  // Digital loans expire on their own, so there is no overdue (red) state —
  // "expires today" is still just a warning.
  const { warning, danger } = useLoanThresholds()
  const isExpiringSoon = daysUntil <= warning

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
    } else {
      setBlueLoans(prev =>
        prev.includes(String(manifestationIsbn))
          ? prev
          : [...prev, manifestationIsbn || "unknown isbn"]
      )
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

  // Same layout as PhysicalLoanCard: the cover box adopts the cover's own
  // aspect ratio so the icon straddles the image edge and the labels below
  // always sit at the same distance, with card height following the content.
  const { width: coverWidth, height: coverHeight } = manifestation.cover.large ?? {}
  const coverAspectRatio = coverWidth && coverHeight ? `${coverWidth} / ${coverHeight}` : "10 / 17"

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full space-y-3 px-[15%]">
        <div className="relative w-full" style={{ aspectRatio: coverAspectRatio }}>
          <CoverPicture
            covers={manifestation.cover}
            alt={`${title} cover billede`}
            withTilt={false}
            className="select-none"
            badge={
              <MaterialTypeIconWrapper
                iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
                className={cn(
                  "outline-1",
                  isCostFree
                    ? "bg-content-blue-100 dark:text-blue-title-dark"
                    : "bg-background-overlay-solid"
                )}
                costFree={isCostFree}
              />
            }
          />
        </div>
        {/* pt clears the material-type icon straddling the cover's bottom edge. */}
        <div className="flex w-full justify-center pt-5">
          <StatusLabel variant={isExpiringSoon ? "warning" : "neutral"}>
            {expiryStatusText(daysUntil, danger)}
          </StatusLabel>
        </div>
        {isCostFree && (
          <div className="flex w-full justify-center">
            <Badge variant={"blue-title"} className="mb-1 lg:mb-2">
              BLÅ
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanCard
