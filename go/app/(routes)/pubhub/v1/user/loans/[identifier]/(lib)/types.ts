import { z } from "zod"

import { createLoanSchema } from "./schemas"

export type TCreateLoan = z.infer<typeof createLoanSchema>
