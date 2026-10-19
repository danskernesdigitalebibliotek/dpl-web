import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getServerEnv } from "@/lib/config/env"

const paramsSchema = z.union([
  z.object({
    tags: z.string(),
    path: z.string().optional(),
    type: z.enum(["page", "layout"]).optional(),
    secret: z.string(),
  }),
  z.object({
    tags: z.string().optional(),
    path: z.string(),
    type: z.enum(["page", "layout"]).optional(),
    secret: z.string(),
  }),
])

export async function GET(request: NextRequest) {
  const secretEnv = getServerEnv("DRUPAL_REVALIDATE_SECRET")
  const searchParams = request.nextUrl.searchParams
  const requestParams = Object.fromEntries(searchParams.entries())

  try {
    const { tags, path, type, secret } = paramsSchema.parse(requestParams)

    if (!secret || secret !== secretEnv) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    if (path) {
      // Passing type "layout" revalidates the whole route subtree below path,
      // so a call with path "/" clears every page. Omitting type keeps the
      // default "page" behaviour, revalidating only the exact path.
      revalidatePath(path, type)
      console.info(
        `[cache/revalidate] Cleared cache for path "${path}" (${type ?? "page"})`
      )
    }

    if (tags) {
      const tagList = tags.split(",")
      tagList.forEach(tag => revalidateTag(tag, "default"))
      console.info(
        `[cache/revalidate] Cleared cache for tags: ${tagList.join(", ")}`
      )
    }

    return NextResponse.json({ message: "Revalidation successful" })
  } catch (e) {
    console.error("Error parsing params:", e)
    return NextResponse.json({ error: "Bad Request" }, { status: 400 })
  }
}
