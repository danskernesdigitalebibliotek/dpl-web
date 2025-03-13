import React from "react"

import { Button } from "@/components/shared/button/Button"
import Icon from "@/components/shared/icon/Icon"
import useGetV1UserLoans from "@/lib/rest/publizon/useGetV1UserLoans"

import Loan from "./Loan"

const LoanList = () => {
  const { data: dataLoans, isLoading: isLoadingLoans } = useGetV1UserLoans()

  return (
    <div className="bg-background-overlay rounded-base col-span-full space-y-8 overflow-hidden py-10">
      <div className="flex items-center justify-between px-10">
        <h2 className="text-typo-heading-4">Bøger jeg har lånt (x)</h2>
        <div className="flex flex-row justify-end gap-x-4">
          <Button disabled={false} variant="icon" ariaLabel="Vis forrige værker">
            <Icon className="h-[24px] w-[24px]" name="arrow-left" />
          </Button>
          <Button disabled={false} variant="icon" ariaLabel="Vis næste værker">
            <Icon className="h-[24px] w-[24px]" name="arrow-right" />
          </Button>
        </div>
      </div>

      <div className="text-typo-body-lg">
        {isLoadingLoans && <p>Loading...</p>}
        {dataLoans?.loans &&
          !isLoadingLoans &&
          dataLoans.loans.map(loan => {
            if (!loan.libraryBook?.identifier) return
            return <Loan key={loan.libraryBook.identifier} isbn={loan.libraryBook.identifier} />
          })}
      </div>
    </div>
  )
}

export default LoanList
