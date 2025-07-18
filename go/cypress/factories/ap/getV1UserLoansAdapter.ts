import { Factory } from "fishery"

import { LoanListResult } from "@/lib/rest/publizon/adapter/generated/model"

export default Factory.define<LoanListResult>(() => {
  return {
    loans: [
      {
        orderId: "eb740fd3-e06d-4e96-9105-f89c3a38bad8",
        orderNumber: "88fcadd6-2d89-48e9-9b34-88bf93ba6f4c",
        orderDateUtc: "2025-07-16T12:17:39.367",
        loanExpireDateUtc: "2025-08-15T12:17:00.813Z",
        isSubscriptionLoan: true,
        libraryBook: {
          identifier: "9788711917141",
          identifierType: 3,
          title: "Kender du J.K. Rowling?",
          publishersName: "Lindhardt og Ringhof",
        },
        fileExtensionType: 3,
      },
      {
        orderId: "1587f822-0284-4e3a-9152-35200d722356",
        orderNumber: "8b49732e-24b7-4be6-8efb-35b82baa1fa4",
        orderDateUtc: "2025-07-02T13:17:05.54",
        loanExpireDateUtc: "2025-08-01T13:16:18.223Z",
        isSubscriptionLoan: true,
        libraryBook: {
          identifier: "9788711917141",
          identifierType: 15,
          title: "Wimpy Kid 17 - Heavy Lört",
          publishersName: "Gyldendal",
        },
        fileExtensionType: 1,
      },
      {
        orderId: "68965ad8-4fb7-4f7b-a699-ca22a4710e4f",
        orderNumber: "be1d2f3b-d022-4887-ba08-31f3de20d905",
        orderDateUtc: "2025-07-16T12:18:12.573",
        loanExpireDateUtc: "2025-08-15T12:17:34.023Z",
        isSubscriptionLoan: true,
        libraryBook: {
          identifier: "8788711917141",
          identifierType: 15,
          title: "Wimpy Kid 18 - Tomgang",
          publishersName: "Gyldendal",
        },
        fileExtensionType: 1,
      },
      {
        orderId: "f8d6d0a2-c78e-4ad8-bfa0-6d9cd6e41039",
        orderNumber: "6731000c-f89c-41cb-82aa-123bbcf0e725",
        orderDateUtc: "2025-07-08T11:00:53.417",
        loanExpireDateUtc: "2025-08-07T11:00:08.91Z",
        isSubscriptionLoan: false,
        libraryBook: {
          identifier: "8788711917141",
          identifierType: 15,
          title: "Rod & Co",
          publishersName: "ProRex Forlag",
        },
        fileExtensionType: 1,
      },
      {
        orderId: "08348b98-d050-40e1-9830-e7ba22bc20c5",
        orderNumber: "c95eaa95-490d-4dcd-b5a5-dadd379d08df",
        orderDateUtc: "2025-07-16T12:17:42.877",
        loanExpireDateUtc: "2025-08-15T12:17:04.323Z",
        isSubscriptionLoan: true,
        libraryBook: {
          identifier: "9788711917141",
          identifierType: 3,
          title: "Kender du J.K. Rowling?",
          publishersName: "Carlsen",
        },
        fileExtensionType: 1,
      },
    ],
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
