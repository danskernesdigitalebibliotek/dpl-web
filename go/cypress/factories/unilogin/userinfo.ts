import { Factory } from "fishery"
import { z } from "zod"

import schemas from "@/app/(routes)/auth/callback/unilogin/schemas"

import tokenSet from "./tokenSet"

type Schema = z.infer<typeof schemas.uniLoginUserInfo>

export default Factory.define<Schema>(() => {
  const tokens = tokenSet.build()
  return {
    sub: tokens.sub?.toString() ?? "",
  }
})
