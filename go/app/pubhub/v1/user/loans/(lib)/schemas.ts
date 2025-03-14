import { z } from "zod"

import { regexDate } from "@/app/pubhub/helper"

export const orderItemSchema = z.object({
  retailerordernumber: z.string(),
  orderdate: z.string().regex(regexDate),
  loanexpiredate: z.string().regex(regexDate),
  book: z.object({
    attributes: z.object({
      id: z.string(),
    }),
  }),
})

export const libraryUserOrderListSchema = z.object({
  response: z.object({
    status: z.object({
      LibraryExtension: z.object({
        usertotalloans: z.string().regex(/^[0-9]+$/),
        usertotalebookloans: z.string().regex(/^[0-9]+$/),
        usertotalsoundloans: z.string().regex(/^[0-9]+$/),
      }),
    }),
    data: z.object({
      orderitem: orderItemSchema.or(z.array(orderItemSchema)),
    }),
  }),
})
