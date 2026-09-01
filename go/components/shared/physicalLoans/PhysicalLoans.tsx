"use client"

import React from "react"

import PhysicalLoanSlider, {
  PhysicalLoanSliderSkeleton,
} from "@/components/shared/physicalLoanSlider/PhysicalLoanSlider"
import PhysicalLoansUniloginTeaser from "@/components/shared/physicalLoans/PhysicalLoansUniloginTeaser"
import usePatronShelf from "@/hooks/usePatronShelf"
import { cn } from "@/lib/helpers/helper.cn"

export type PhysicalLoansProps = {
  className?: string
}

const PhysicalLoans = ({ className }: PhysicalLoansProps) => {
  const { session, loanItems, reservationItems, isLibraryLogin, isLoading, isError } =
    usePatronShelf()

  // FBS is only available with a library login.
  if (session?.type === "unilogin") {
    return <PhysicalLoansUniloginTeaser className={className} />
  }

  return (
    <div className={cn("col-span-full", className)}>
      {isLoading && <PhysicalLoanSliderSkeleton />}
      {!isLoading && !isError && isLibraryLogin && (
        <PhysicalLoanSlider items={loanItems} reservationItems={reservationItems} />
      )}
    </div>
  )
}

export default PhysicalLoans
