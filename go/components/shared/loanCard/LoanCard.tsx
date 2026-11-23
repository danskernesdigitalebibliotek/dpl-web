"use client"

import {
  type DigitalLoan,
  isCostFreeLoan,
  useDigitalLoanDecision,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
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
import { getBiblioDueDate } from "@/lib/helpers/helper.due-status"
import { biblioLoanForManifestation } from "@/lib/helpers/helper.patron"
import { getPublizonIdentifierFromManifestation } from "@/lib/helpers/ids"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type LoanCardProps = {
  manifestation: ManifestationSearchPageTeaserFragment
  title: string
  className?: string
  // Loans made through the Biblio adapter, shown alongside the Publizon ones
  // while the two providers coexist.
  // TODO(publizon-sunset): remove when the Publizon API is phased out — the
  // prop becomes the only loan source and useGetV1UserLoans goes.
  biblioLoans?: DigitalLoan[]
  setAudioLoans: React.Dispatch<React.SetStateAction<string[]>>
  setEbookLoans: React.Dispatch<React.SetStateAction<string[]>>
  setBlueLoans: React.Dispatch<React.SetStateAction<string[]>>
}

const LoanCard = ({
  manifestation,
  title,
  className,
  biblioLoans,
  setAudioLoans,
  setEbookLoans,
  setBlueLoans,
}: LoanCardProps) => {
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()

  const manifestationIsbn = manifestation.identifiers.find(
    identifier => identifier.type === "ISBN"
  )?.value
  const materialId = getPublizonIdentifierFromManifestation(manifestation)
  const {
    data: loanDecision,
    isPending: isDecisionPending,
    fetchStatus: decisionFetchStatus,
  } = useDigitalLoanDecision(materialId ?? null)

  const loan = dataLoans?.loans?.find(loan => loan.libraryBook?.identifier === manifestationIsbn)
  const biblioLoan = biblioLoanForManifestation(manifestation, biblioLoans)
  const dueDate = loan?.loanExpireDateUtc ?? (biblioLoan && getBiblioDueDate(biblioLoan.endDate))

  const materialTypeCode = manifestation.materialTypes[0]?.materialTypeSpecific.code

  const isCostFree =
    isCostFreeLoan(loanDecision?.loanProvider) || isPodcastMaterialType(materialTypeCode)

  // A decision that is pending with nothing in flight is one that will never
  // arrive: no patron session, or a material with no id to ask about.
  const isAwaitingDecision = isDecisionPending && decisionFetchStatus !== "idle"

  useEffect(() => {
    // Waits for the decision to settle, not to succeed: a material Biblio has
    // no answer for counts as not cost-free rather than dropping out of every
    // list. A podcast is cost-free without asking.
    if (isAwaitingDecision && !isPodcastMaterialType(materialTypeCode)) {
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
  }, [manifestation, isCostFree, isAwaitingDecision])

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
          alt={title}
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
          <DigitalExpiryStatusLabel dueDate={dueDate} />
        </div>
        {/* Always rendered so the card height is stable — the badge fades in
            when the loan decision marks the title as cost-free. */}
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
