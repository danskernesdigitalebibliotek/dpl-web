import { z } from "zod"

import { getProductsSchema } from "./schemas"

export type TGetProducts = z.infer<typeof getProductsSchema>
