import { z } from "zod"

import { userInfoSchema } from "./schemas"

export type TUserInfo = z.infer<typeof userInfoSchema>
