import { z } from "zod"

import { regexDate } from "@/app/(server)/pubhub/helper"

export const getProductsSchema = z.object({
  response: z.object({
    status: z.object({
      code: z.string(),
      message: z.string(),
    }),
    data: z.object({
      title: z.string().optional(),
      coverimage: z.string().optional(),
      thumbnailimage: z.string().optional(),
      teaser: z.object({
        link: z.string().optional(),
      }),
      formats: z.object({
        format_id: z.string().optional(),
        name: z.string().optional(),
        size_bytes: z.string().optional(),
        duration_minutes: z.string().optional(),
        duration_48kbit_seconds: z.string().optional(),
      }),
      first_published: z.string().regex(regexDate).optional(),
      description: z.string().optional(),
    }),
    costfree: z.string().optional(),
  }),
})
