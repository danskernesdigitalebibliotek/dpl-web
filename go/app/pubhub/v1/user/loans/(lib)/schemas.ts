import { z } from "zod"

// Zod schemas
export const orderItemSchema = z.object({
  book: z.object({
    attributes: z.object({
      id: z.string(),
    }),
  }),
})
export const libraryUserOrderListSchema = z.object({
  response: z.object({
    data: z.object({
      orderitem: orderItemSchema.or(z.array(orderItemSchema)),
    }),
  }),
})
