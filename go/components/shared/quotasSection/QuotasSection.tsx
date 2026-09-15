import React from "react"

import { Badge } from "@/components/shared/badge/Badge"
import { cyKeys } from "@/cypress/support/constants"
import useGetV1LibraryProfile from "@/lib/rest/publizon/useGetV1LibraryProfile"

export type QuotasSectionProps = {
  audioLoans: string[]
  ebookLoans: string[]
  blueLoans: string[]
  onViewAll: () => void
}

const QuotasSection = ({ audioLoans, ebookLoans, blueLoans, onViewAll }: QuotasSectionProps) => {
  const { data, isLoading } = useGetV1LibraryProfile()

  if (isLoading) {
    return <QuotasSectionSkeleton />
  }

  return (
    <div className="col-span-full">
      <div
        className="bg-background duration-dark-mode p-grid-edge rounded-base md:rounded-base w-full
          space-y-4 transition-all md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-typo-subtitle-sm opacity-70">Mine digitale lån</h3>
          <button
            type="button"
            onClick={onViewAll}
            // Starts with the visible label, so voice control still matches.
            aria-label="Vis alle digitale lån"
            data-cy={cyKeys["view-all-digital-loans-button"]}
            className="text-typo-link focus-visible cursor-pointer underline">
            Vis alle
          </button>
        </div>
        <div className="gap-grid-edge flex w-full flex-col md:gap-6 lg:flex-row">
          <div
            className="bg-background-overlay flex flex-1 flex-col items-center justify-center gap-2
              rounded-sm p-6 md:min-h-36">
            <span className="text-typo-heading-3 block">
              {ebookLoans.length} af {data?.maxConcurrentEbookLoansPerBorrower || 0}
            </span>
            <span className="text-typo-subtitle-sm block opacity-70">E-bøger</span>
          </div>
          <div
            className="bg-background-overlay flex flex-1 flex-col items-center justify-center gap-2
              rounded-sm p-6 md:min-h-36">
            <span className="text-typo-heading-3 block">
              {audioLoans.length} af {data?.maxConcurrentAudioLoansPerBorrower || 0}
            </span>
            <span className="text-typo-subtitle-sm block opacity-70">Lydbøger</span>
          </div>
          <div
            className="bg-background-overlay flex flex-col items-center justify-center gap-2
              rounded-sm p-6 md:min-h-36 lg:flex-[2] lg:flex-row lg:gap-12 lg:px-14">
            <div className="flex shrink-0 flex-col items-center gap-2">
              <p className="text-typo-heading-3">{blueLoans.length}</p>
              <div className="flex items-center">
                <Badge variant="blue-title" className="px-4 py-1.5">
                  BLÅ
                </Badge>
              </div>
            </div>
            <p className="text-typo-subtitle-sm text-center opacity-70 lg:flex-1 lg:text-left">
              Bøger og podcasts med et blåt mærke kan du altid låne, selvom du har brugt alle dine
              lån. {/* TODO: point at a blue-titles search once that filter exists. */}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const QuotasSectionSkeleton = () => {
  return (
    <div className="col-span-full">
      <div className="bg-background-skeleton rounded-base h-56 w-full animate-pulse" />
    </div>
  )
}

export default QuotasSection
