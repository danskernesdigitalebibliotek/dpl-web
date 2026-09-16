"use client"

import { useDigitalLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import LoanSlider, { LoanSliderSkeleton } from "@/components/shared/loanSlider/LoanSlider"
import { useBiblioAdapter } from "@/hooks/useBiblioAdapter"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { digitalLoanIsbns, isbnSearchCql, pairDigitalLoanWorks } from "@/lib/helpers/helper.patron"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type UserLoansProps = {
  className?: string
}

const UserLoans = ({ className }: UserLoansProps) => {
  const viaBiblioAdapter = useBiblioAdapter()
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()
  // With the adapter on, both providers' loans show side by side: new loans
  // live in Biblio, remaining Publizon loans until they expire. Patron-gated
  // in the service layer, so it never fires for Unilogin sessions.
  // TODO(publizon-sunset): remove when the Publizon API is phased out —
  // useGetV1UserLoans goes and the biblio loans become the only source for
  // isbns, pairing and the slider props.
  const { data: biblioLoansData, isLoading: isLoadingBiblioLoans } = useDigitalLoans({
    enabled: viaBiblioAdapter,
  })
  const biblioLoans = viaBiblioAdapter ? biblioLoansData?.loans : undefined
  const isbns = digitalLoanIsbns(dataLoans, biblioLoans)

  const { data: dataComplexSearch, isLoading: isLoadingComplexSearch } =
    useComplexSearchForWorkTeaserQuery(
      {
        cql: isbnSearchCql(isbns),
        offset: 0,
        limit: 100,
        filters: {},
      },
      { enabled: isbns.length > 0 }
    )

  const loanWorks = pairDigitalLoanWorks(
    dataLoans,
    dataComplexSearch?.complexSearch.works,
    biblioLoans
  )
  const isLoading =
    isLoadingLoans || isLoadingComplexSearch || (viaBiblioAdapter && isLoadingBiblioLoans)

  return (
    <div className={cn("col-span-full", className)}>
      {isLoading && <LoanSliderSkeleton />}
      {!isLoading && loanWorks && dataLoans && (
        <LoanSlider works={loanWorks} loanData={dataLoans} biblioLoans={biblioLoans} />
      )}
    </div>
  )
}

export default UserLoans
