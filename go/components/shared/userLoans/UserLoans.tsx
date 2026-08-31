"use client"

import React from "react"

import LoanSlider, { LoanSliderSkeleton } from "@/components/shared/loanSlider/LoanSlider"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { digitalLoanIsbns, isbnSearchCql, pairDigitalLoanWorks } from "@/lib/helpers/helper.patron"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type UserLoansProps = {
  className?: string
}

const UserLoans = ({ className }: UserLoansProps) => {
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()
  const isbns = digitalLoanIsbns(dataLoans)

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

  const loanWorks = pairDigitalLoanWorks(dataLoans, dataComplexSearch?.complexSearch.works)

  return (
    <div className={cn("col-span-full", className)}>
      {(isLoadingLoans || isLoadingComplexSearch) && <LoanSliderSkeleton />}
      {!isLoadingLoans && !isLoadingComplexSearch && loanWorks && dataLoans && (
        <LoanSlider works={loanWorks} loanData={dataLoans} />
      )}
    </div>
  )
}

export default UserLoans
