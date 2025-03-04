import { z } from "zod"

// Zod schemas
export const orderItemSchema = z.object({
  retailerordernumber: z.string(),
  orderdate: z.string(),
  loanexpiredate: z.string(),
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
        usertotalloans: z.string(),
        usertotalebookloans: z.string(),
        usertotalsoundloans: z.string(),
      }),
    }),
    data: z.object({
      orderitem: orderItemSchema.or(z.array(orderItemSchema)),
    }),
  }),
})
