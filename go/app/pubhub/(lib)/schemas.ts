import { z } from "zod"

export const userInfoSchema = z.object({
  uniid: z.string(),
  institution_ids: z.string().array(),
})
