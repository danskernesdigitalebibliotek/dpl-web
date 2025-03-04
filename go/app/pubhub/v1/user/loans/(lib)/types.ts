import { isArray } from "lodash"
import { z } from "zod"

import { libraryUserOrderListSchema, orderItemSchema } from "./schemas"

type TOrderItem = z.infer<typeof orderItemSchema>

export const isOrderItem = (input: TOrderItem | TOrderItem[]): input is TOrderItem =>
  !isArray(input) && orderItemSchema.safeParse(input).success

export type TLibraryUserOrderList = z.infer<typeof libraryUserOrderListSchema>
