import React from "react"

import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"
import useGetV1LibraryProfile from "@/lib/rest/publizon/useGetV1LibraryProfile"

export type LoansDetailsProps = {
  loanData: LoanListResult
}

const LoansDetails = ({ loanData }: LoansDetailsProps) => {
  const { data, isLoading } = useGetV1LibraryProfile()

  if (isLoading) {
    return <QuotasSectionSkeleton />
  }

  return (
    <div
      className="col-span-full mt-0 flex flex-row flex-wrap items-start justify-between gap-10 px-10 md:gap-0
        lg:mt-12 lg:flex-nowrap lg:gap-0">
      <div
        className="bg-background duration-dark-mode col-span-6 w-full space-y-6 rounded-sm px-10 pt-6 pb-9
          transition-all md:w-[49%]">
        <h3 className="text-typo-subtitle-sm col-span-full opacity-50">Kvote</h3>
        <div className="align-center flex w-full flex-row justify-between">
          <div className="bg-background-overlay flex h-36 w-[47%] flex-col items-center justify-center gap-4 rounded-sm">
            <p className="text-typo-heading-3">
              {loanData.userData?.totalEbookLoans} af{" "}
              {data?.maxConcurrentEbookLoansPerBorrower || 0}
            </p>
            <p className="text-typo-subtitle-sm opacity-50">E-bøger</p>
          </div>
          <div className="bg-background-overlay flex h-36 w-[47%] flex-col items-center justify-center gap-4 rounded-sm">
            <p className="text-typo-heading-3">
              {loanData.userData?.totalAudioLoans} af{" "}
              {data?.maxConcurrentAudioLoansPerBorrower || 0}
            </p>
            <p className="text-typo-subtitle-sm opacity-50">Lydbøger</p>
          </div>
        </div>
      </div>
      <div
        className="bg-background duration-dark-mode col-span-6 w-full space-y-6 rounded-sm px-10 pt-6 pb-9
          transition-all md:w-[49%]">
        <h3 className="text-typo-subtitle-sm col-span-full opacity-60">Blå titler</h3>
        <div className="flex w-full flex-row justify-between">
          <div className="bg-background-overlay flex h-36 w-full flex-col items-center justify-center gap-4 rounded-sm px-10">
            <p className="text-typo-subtitle-md px-2 text-center opacity-50">
              Bøger og podcasts med et blåt mærke kan du altid låne, selvom du har brugt alle dine
              lån
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export const QuotasSectionSkeleton = () => {
  return (
    <div
      className="col-span-full mt-12 flex flex-row flex-wrap items-start justify-between gap-10 px-10 md:gap-0
        lg:flex-nowrap lg:gap-0">
      <div
        className="bg-background-skeleton col-span-6 h-36 w-full animate-pulse space-y-6 rounded-sm px-10 pt-6 pb-9
          md:w-[49%]"
      />
      <div
        className="bg-background-skeleton col-span-6 h-36 w-full animate-pulse space-y-6 rounded-sm px-10 pt-6 pb-9
          md:w-[49%]"
      />
    </div>
  )
}

export default LoansDetails
