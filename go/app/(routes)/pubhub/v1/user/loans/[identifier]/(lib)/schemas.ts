import { z } from "zod"

import { regexDate } from "@/app/(routes)/pubhub/helper"

export const createLoanSchema = z.object({
  response: z.object({
    status: z.object({
      code: z.string(),
      message: z.string(),
    }),
    data: z.object({
      downloadurl: z.string(),
      expirationdateutc: z.string().regex(regexDate),
      retailerordernumber: z.string(),
      internalordernumber: z.string(),
    }),
  }),
})
