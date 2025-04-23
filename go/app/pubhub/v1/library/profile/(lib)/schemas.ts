import { z } from "zod"

import { regexNumber } from "@/app/pubhub/helper"

export const getLibraryProfileSchema = z.object({
  response: z.object({
    status: z.object({
      code: z.string(),
      message: z.string(),
    }),
    data: z.object({
      AudioLoanDurationInDays: z.string().regex(regexNumber),
      DbcId: z.string(),
      Id: z.string(),
      LoanDurationInDays: z.string().regex(regexNumber),
      MaxAmountPerMonth: z.string().regex(regexNumber),
      MaxAmountPerMonthNotificationThreshold: z.string().regex(regexNumber),
      MaxAudioAmountPerMonth: z.string().regex(regexNumber),
      MaxAudioAmountPerMonthNotificationThreshold: z.string().regex(regexNumber),
      MaxAudioCancellationsPerMonth: z.string().regex(regexNumber),
      MaxCancellationsPerMonth: z.string().regex(regexNumber),
      MaxConcurrentAudioLoansPerBorrower: z.string().regex(regexNumber),
      MaxConcurrentAudioReservationsPerBorrower: z.string().regex(regexNumber),
      MaxConcurrentLoansPerBorrower: z.string().regex(regexNumber),
      MaxConcurrentReservationsPerBorrower: z.string().regex(regexNumber),
      Name: z.string(),
    }),
  }),
})
