"use client"

import { differenceInDays } from "date-fns"

import {
  getManifestationMaterialTypeIcon,
  isManifestationPodcast,
} from "@/components/pages/workPageLayout/helper"
import { Badge } from "@/components/shared/badge/Badge"
import { CoverPicture, CoverPictureSkeleton } from "@/components/shared/coverPicture/CoverPicture"
import MaterialTypeIconWrapper from "@/components/shared/workCard/MaterialTypeIconWrapper"
import {
  ManifestationSearchPageTeaserFragment,
  ManifestationWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { getCoverUrls, getLowResCoverUrl } from "@/lib/helpers/helper.covers"
import { useGetCoverCollection } from "@/lib/rest/cover-service-api/generated/cover-service"
import { GetCoverCollectionSizesItem } from "@/lib/rest/cover-service-api/generated/model"
import useGetV1ProductsIdentifier from "@/lib/rest/publizon/useGetV1ProductsIdentifier"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type LoanCardProps = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  className?: string
}

const LoanCard = ({ manifestation, title, className }: LoanCardProps) => {
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()
  const { data: dataCovers, isLoading: isLoadingCovers } = useGetCoverCollection({
    type: "pid",
    identifiers: [manifestation.pid],
    sizes: [
      "xx-small, small, small-medium, medium, medium-large, large, original, default" as GetCoverCollectionSizesItem,
    ],
  })
  const manifestationIsbn = manifestation.identifiers.find(
    identifier => identifier.type === "ISBN"
  )?.value
  const { data: dataProducts } = useGetV1ProductsIdentifier(manifestationIsbn || "")
  const lowResCover = getLowResCoverUrl(dataCovers)
  const coverSrc = getCoverUrls(
    dataCovers,
    [manifestation.pid],
    ["default", "original", "large", "medium-large", "medium", "small-medium", "small", "xx-small"]
  )
  const loan = dataLoans?.loans?.find(loan => loan.libraryBook?.identifier === manifestationIsbn)
  const targetDate = new Date(loan?.loanExpireDateUtc || "")
  const today = new Date()
  const daysUntil = differenceInDays(targetDate, today)

  if (isLoadingCovers || isLoadingLoans) {
    return (
      <div className={cn("relative flex aspect-5/7 h-full w-full", className)}>
        <div className="aspect-1/1 h-full w-full p-14">
          <CoverPictureSkeleton />
        </div>
      </div>
    )
  }

  const isCostFree =
    dataProducts?.product?.costFree ||
    isManifestationPodcast(manifestation as ManifestationWorkPageFragment)

  return (
    <div className={cn("relative flex aspect-5/7 h-full w-full", className)}>
      <div className="h-full w-full">
        <div className="block h-full w-full space-y-3 px-[15%]">
          <div className="relative h-[85%]">
            <CoverPicture
              lowResSrc={lowResCover || ""}
              src={coverSrc?.[0] || ""}
              alt={`${title} cover billede`}
              withTilt={false}
              className="select-none"
            />
            <MaterialTypeIconWrapper
              iconName={getManifestationMaterialTypeIcon(
                manifestation as ManifestationWorkPageFragment
              )}
              className={cn("z-floating-icon relative mx-auto -mt-14 outline-1", {
                "bg-background": !isCostFree,
              })}
              costFree={isCostFree}
            />
          </div>
          <p className="text-typo-subtitle-sm text-foreground/50 w-full text-center break-words">{`Udløber om ${daysUntil} dage`}</p>
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
