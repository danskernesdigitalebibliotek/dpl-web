import { revalidatePath, revalidateTag } from "next/cache"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { getServerEnv } from "@/lib/config/env"

const paramsSchema = z.union([
  z.object({
    tags: z.string(),
    path: z.string().optional(),
    secret: z.string(),
  }),
  z.object({
    tags: z.string().optional(),
    path: z.string(),
    secret: z.string(),
  }),
])

export async function GET(request: NextRequest) {
  const secretEnv = getServerEnv("DRUPAL_REVALIDATE_SECRET")
  const searchParams = request.nextUrl.searchParams
  const requestParams = Object.fromEntries(searchParams.entries())

  try {
    const { tags, path, secret } = paramsSchema.parse(requestParams)

    if (!secret || secret !== secretEnv) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 })
    }

    if (path) {
      revalidatePath(path)
      console.info(`[cache/revalidate] Cleared cache for path "${path}"`)
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
