"use client"

import { useLoans } from "@danskernesdigitalebibliotek/dpl-service-layer"
import React from "react"

import PhysicalLoanSlider, {
  PhysicalLoanItem,
  PhysicalLoanSliderSkeleton,
} from "@/app/(pages)/user/profile/PhysicalLoanSlider"
import { useComplexSearchForWorkTeaserQuery } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"
import { pidToFaust } from "@/lib/helpers/ids"

export type PhysicalLoansProps = {
  className?: string
}

const PhysicalLoans = ({ className }: PhysicalLoansProps) => {
  const { data: loans, isLoading: isLoadingLoans } = useLoans()
  const loanFausts = loans?.map(loan => loan.recordId) || []
  const cql = loanFausts.map(faust => `term.faust=${faust}`).join(" OR ") || ""

  const { data: dataComplexSearch, isLoading: isLoadingComplexSearch } =
    useComplexSearchForWorkTeaserQuery(
      {
        cql,
        offset: 0,
        limit: 100,
        filters: {},
      },
      { enabled: loanFausts.length > 0 }
    )

  // Pair each loan with the work + exact manifestation it was loaned as, by
  // matching the loan's FBS record id (FAUST) against the manifestation pid.
  // Every FBS loan stays in the list — a loan with no FBI match (interlibrary
  // loans, local records) renders as a fallback card instead of vanishing.
  const loanItems = (loans || []).map<PhysicalLoanItem>(loan => {
    const work = dataComplexSearch?.complexSearch.works.find(w =>
      w.manifestations.all.some(manifestation => pidToFaust(manifestation.pid) === loan.recordId)
    )
    const manifestation = work?.manifestations.all.find(
      manifestation => pidToFaust(manifestation.pid) === loan.recordId
    )
    return { loan, work, manifestation }
  })

  return (
    <div className={cn("col-span-full", className)}>
      {(isLoadingLoans || isLoadingComplexSearch) && <PhysicalLoanSliderSkeleton />}
      {!isLoadingLoans && !isLoadingComplexSearch && loans && (
        <PhysicalLoanSlider items={loanItems} />
      )}
    </div>
  )
}

export default PhysicalLoans
