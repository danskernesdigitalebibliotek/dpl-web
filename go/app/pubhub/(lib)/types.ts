import { z } from "zod"

import { userInfoSchema } from "./schemas"

export type TuserInfo = z.infer<typeof userInfoSchema>
