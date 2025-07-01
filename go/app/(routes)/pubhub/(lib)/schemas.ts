import { z } from "zod"

export const uniLoginUserInfoSchema = z.object({
  uniid: z.string(),
  institutionIds: z.string().array(),
})
