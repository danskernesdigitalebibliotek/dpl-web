import { Factory } from "fishery"

import { LibraryProfile } from "@/lib/rest/publizon/adapter/generated/model"

export default Factory.define<LibraryProfile>(() => {
  return {
    id: 810,
    name: "København Bibliotek",
    isilNumber: "DK-710100",
    ebookLoanDurationInDays: 30,
    maxEbookAmountPerMonth: 500000,
    maxEbookAmountPerMonthNotificationThreshold: 300000,
    maxConcurrentEbookLoansPerBorrower: 5,
    maxConcurrentEbookReservationsPerBorrower: 3,
    maxEbookCancellationsPerMonth: 20,
    audioLoanDurationInDays: 30,
    maxAudioAmountPerMonth: 500000,
    maxAudioAmountPerMonthNotificationThreshold: 400000,
    maxConcurrentAudioLoansPerBorrower: 5,
    maxConcurrentAudioReservationsPerBorrower: 3,
    maxAudioCancellationsPerMonth: 20,
    testCards: [
      {
        testCardNumber: "AHTGQW",
      },
      {
        testCardNumber: "9BBNPK",
      },
    ],
  }
})
