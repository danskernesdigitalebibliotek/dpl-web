import {
  getDigitalLoanQuota,
  useDigitalLoanQuotas,
} from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import { Badge } from "@/components/shared/badge/Badge"
import { cyKeys } from "@/cypress/support/constants"
import { useBiblioAdapter } from "@/hooks/useBiblioAdapter"
import useGetV1LibraryProfile from "@/lib/rest/publizon/useGetV1LibraryProfile"

export type QuotasSectionProps = {
  audioLoans: string[]
  ebookLoans: string[]
  blueLoans: string[]
  onViewAll: () => void
}

const QuotasSection = ({ audioLoans, ebookLoans, blueLoans, onViewAll }: QuotasSectionProps) => {
  const viaBiblioAdapter = useBiblioAdapter()
  // TODO(publizon-sunset): remove when the Publizon API is phased out — the
  // library profile fetch and the fallback numbers below go; the adapter's
  // quotas become the only source.
  const { data, isLoading } = useGetV1LibraryProfile()
  // With the adapter on, the quota is the adapter's own: new loans can only
  // be made there, and its counters already exclude cost-free ("BLÅ") loans.
  // Patron-gated in the service layer, so it never fires for Unilogin
  // sessions — they keep the Publizon numbers while their old loans run out.
  const { data: biblioQuotas, isLoading: isLoadingBiblioQuotas } = useDigitalLoanQuotas({
    enabled: viaBiblioAdapter,
  })

  if (isLoading || (viaBiblioAdapter && isLoadingBiblioQuotas)) {
    return <QuotasSectionSkeleton />
  }

  // The adapter counts the patron's loans itself; the Publizon path counts
  // the loan cards shown and reads the caps off the library profile.
  const ebookQuota =
    viaBiblioAdapter && biblioQuotas
      ? getDigitalLoanQuota({ quotas: biblioQuotas, format: "ebook", period: "concurrent" })
      : { current: ebookLoans.length, limit: data?.maxConcurrentEbookLoansPerBorrower }
  const audioQuota =
    viaBiblioAdapter && biblioQuotas
      ? getDigitalLoanQuota({ quotas: biblioQuotas, format: "audiobook", period: "concurrent" })
      : { current: audioLoans.length, limit: data?.maxConcurrentAudioLoansPerBorrower }

  return (
    <div className="col-span-full">
      <div
        className="bg-background duration-dark-mode p-grid-edge rounded-base md:rounded-base w-full
          space-y-4 transition-all md:p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-typo-subtitle-sm opacity-70">Mine lån</h3>
          <button
            type="button"
            onClick={onViewAll}
            data-cy={cyKeys["view-all-digital-loans-button"]}
            className="text-typo-link focus-visible cursor-pointer underline">
            Vis alle
          </button>
        </div>
        <div className="gap-grid-edge flex w-full flex-col md:gap-6 lg:flex-row">
          {/* The boxes open the same modal as "Vis alle". */}
          <button
            type="button"
            onClick={onViewAll}
            className="bg-background-overlay focus-visible flex flex-1 cursor-pointer flex-col
              items-center justify-center gap-2 rounded-sm p-6 md:min-h-36">
            <span className="text-typo-heading-3 block">
              {ebookQuota.current} af {ebookQuota.limit || 0}
            </span>
            <span className="text-typo-subtitle-sm block opacity-70">E-bøger</span>
          </button>
          <button
            type="button"
            onClick={onViewAll}
            className="bg-background-overlay focus-visible flex flex-1 cursor-pointer flex-col
              items-center justify-center gap-2 rounded-sm p-6 md:min-h-36">
            <span className="text-typo-heading-3 block">
              {audioQuota.current} af {audioQuota.limit || 0}
            </span>
            <span className="text-typo-subtitle-sm block opacity-70">Lydbøger</span>
          </button>
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
