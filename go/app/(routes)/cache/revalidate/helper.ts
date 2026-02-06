import { z } from "zod"

export const paramsSchema = z.union([
  z.object({
    type: z.literal("tag"),
    tags: z.array(z.string().regex(/^[a-zA-Z0-9-]+$/)),
  }),
  z.object({
    type: z.literal("path"),
    paths: z.array(z.string().regex(/^\/[a-zA-Z0-9-\/]+$/)),
    contentType: z.string().optional(),
  }),
])

export const resolveRevalidationPath = ({
  path,
  params,
}: {
  path: string
  params: z.infer<typeof paramsSchema>
}) => {
  if (params.type !== "path") {
    return
  }

  switch (params.contentType ?? "unknown") {
    case "article":
      return `/artikel${path}`
    case "unknown":
      return path
  }
}
