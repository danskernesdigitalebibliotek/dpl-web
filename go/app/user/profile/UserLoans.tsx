"use client"

import React from "react"

import LoanSlider, { LoanSliderSkeleton } from "@/app/user/profile/LoanSlider"
import {
  ManifestationSearchPageTeaserFragment,
  WorkTeaserSearchPageFragment,
  useComplexSearchForWorkTeaserQuery,
} from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

export type UserLoansProps = {
  className?: string
}

const UserLoans = ({ className }: UserLoansProps) => {
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()
  const getIsbnsFromLoans = (loans: LoanListResult["loans"] | null | undefined) => {
    return loans?.map(loan => loan.libraryBook?.identifier) || []
  }
  const { data: dataComplexSearch, isLoading: isLoadingComplexSearch } =
    useComplexSearchForWorkTeaserQuery(
      {
        cql:
          getIsbnsFromLoans(dataLoans?.loans)
            .map(isbn => `term.isbn=${isbn}`)
            .join(" OR ") || "",
        offset: 0,
        limit: 100,
        filters: {},
      },
      { enabled: !!dataLoans?.loans }
    )
  // Create an array of works with the matching manifestation inside out of the LOAN ISBNS
  // instead of ComplexSearch data so that we have exactly one manifestation per loan
  const loanWorks: WorkTeaserSearchPageFragment[] | undefined = getIsbnsFromLoans(
    dataLoans?.loans
  ).reduce((isbnAcc, isbn) => {
    // Find the work that contains the matching ISBN inside one of its manifestations
    const loanWork = dataComplexSearch?.complexSearch.works.find(work => {
      return work.manifestations.all.some(manifestation =>
        manifestation.identifiers.some(identifier => identifier.value === isbn)
      )
    })
    // Skip if no matching work is found
    if (!loanWork) {
      return isbnAcc
    }
    // Find the specific manifestation inside the found work
    const loanManifestation: ManifestationSearchPageTeaserFragment | undefined =
      loanWork.manifestations.all.find(manifestation =>
        manifestation.identifiers.some(identifier => identifier.value === isbn)
      )
    // Skip if no matching manifestation is found
    if (!loanManifestation) {
      return isbnAcc
    }
    // Create a new work object with only the matching manifestation
    const workWithSingleManifestation: WorkTeaserSearchPageFragment = {
      ...loanWork,
      manifestations: { all: [loanManifestation], bestRepresentation: loanManifestation },
    }
    return [...isbnAcc, workWithSingleManifestation]
  }, [] as WorkTeaserSearchPageFragment[])

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
