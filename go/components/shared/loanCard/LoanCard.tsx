"use client"

import { useEffect } from "react"

import {
  getManifestationMaterialTypeIcon,
  isAudioMaterialType,
  isEbookMaterialType,
  isPodcastMaterialType,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import DigitalExpiryStatusLabel from "@/components/shared/loanCard/DigitalExpiryStatusLabel"
import ManifestationCover from "@/components/shared/manifestationCover/ManifestationCover"
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

  return (
    <div className={cn("relative w-full", className)}>
      <div className="w-full space-y-3 px-[15%]">
        <ManifestationCover
          cover={manifestation.cover}
          iconName={getManifestationMaterialTypeIcon(manifestation) || "book"}
          alt={`${title} cover billede`}
          className="w-full"
          costFree={isCostFree}
          iconClassName={
            isCostFree
              ? "bg-content-blue-100 dark:text-blue-title-dark"
              : "bg-background-overlay-solid"
          }
        />
        {/* pt clears the material-type icon straddling the cover's bottom edge. */}
        <div className="flex w-full justify-center pt-5">
          <DigitalExpiryStatusLabel dueDate={loan?.loanExpireDateUtc} />
        </div>
        {/* Always rendered so the card height is stable — the badge fades in
            when the product data marks the title as cost-free. */}
        <div className="flex w-full justify-center" aria-hidden={!isCostFree}>
          <Badge
            variant={"blue-title"}
            className={cn(
              "mb-1 transition-opacity duration-300 lg:mb-2",
              isCostFree ? "opacity-100" : "opacity-0"
            )}>
            BLÅ
          </Badge>
        </div>
      </div>
    </div>
  )
}

export default LoanCard
