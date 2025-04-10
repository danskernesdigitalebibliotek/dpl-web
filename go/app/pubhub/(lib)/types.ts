import { z } from "zod"

import { uniLoginUserInfoSchema } from "./schemas"

export type TUserInfo = z.infer<typeof uniLoginUserInfoSchema>
