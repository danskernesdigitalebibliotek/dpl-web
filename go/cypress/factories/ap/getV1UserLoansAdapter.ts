import { addDays, formatISO } from "date-fns"
import { Factory } from "fishery"

import { Loan, LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

export const loanFactory = Factory.define<Loan>(({ sequence }) => {
  const orderDate = addDays(Date.now(), sequence)
  const expireDate = addDays(orderDate, 30)

  return {
    orderId: "eb740fd3-e06d-4e96-9105-f89c3a38bad8",
    orderNumber: "88fcadd6-2d89-48e9-9b34-88bf93ba6f4c",
    orderDateUtc: formatISO(orderDate),
    loanExpireDateUtc: formatISO(expireDate),
    isSubscriptionLoan: true,
    libraryBook: {
      identifier: "8788711917141",
      identifierType: 3,
      title: "Kender du J.K. Rowling?",
      publishersName: "Lindhardt og Ringhof",
    },
    fileExtensionType: 3,
  }
})

export default Factory.define<LoanListResult>(({ transientParams }) => {
  const { identifiers } = transientParams

  // for each identifier, create a loan and add it to the loans array
  const loans = identifiers.map((identifier: string) => {
    return loanFactory.build({ libraryBook: { identifier } })
  })

  return {
    loans: loans,
    libraryData: {
      loanDurationDays: 30,
      maxConcurrentEbookLoansPerBorrower: 3,
      maxConcurrentAudiobookLoansPerBorrower: 3,
      maxAmountPerMonth: 135000,
    },
    userData: {
      totalLoans: 5,
      totalEbookLoans: 1,
      totalAudioLoans: 4,
      ebookLoansRemaining: 2,
      audiobookLoansRemaining: 1,
      ebookLoanAvailableUtc: "2025-07-17T15:18:15.2779609Z",
      audioLoanAvailableUtc: "2025-07-17T15:18:15.2779609Z",
      friendlyCardNumber: "PNNCZ7",
    },
    code: 101,
    message: "OK (#101).",
  }
})
