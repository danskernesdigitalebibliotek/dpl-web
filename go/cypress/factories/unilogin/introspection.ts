import { Factory } from "fishery"
import type { IntrospectionResponse } from "openid-client"
import { z } from "zod"

import schemas from "@/app/(routes)/auth/callback/unilogin/schemas"

import { institution_ids, uniid } from "./tokenSet"

type IntrospectionSchema = z.infer<typeof schemas.introspect>

export default Factory.define<IntrospectionSchema & IntrospectionResponse>(() => {
  return {
    active: true,
    institution_ids,
    uniid,
  }
})
