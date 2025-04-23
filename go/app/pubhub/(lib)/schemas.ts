import { z } from "zod"

export const uniLoginUserInfoSchema = z.object({
  uniid: z.string(),
  institution_ids: z.string().array(),
})
