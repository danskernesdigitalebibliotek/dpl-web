import { notFound } from "next/navigation"
import { NextRequest } from "next/server"
import { z } from "zod"

import { getSession } from "@/lib/session/session"

import { TRoute, publizonResources } from "./publizonResources"

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>
  }
) {
  const session = await getSession()

  try {
    z.object({
      isLoggedIn: z.literal(true),
      type: z.literal("unilogin"),
    }).parse(session)
  } catch (error) {
    console.error(error)
    return new Response("Not Authorized", { status: 401 })
  }

  try {
    const userInfo = z
      .object({
        uniid: z.string(),
        institution_ids: z.string().regex(/^\[.+\]+$/),
      })
      .parse(session?.userInfo)

    const slug = (await params).slug
    const resources = await publizonResources(userInfo.uniid)
    const currentPath = request.nextUrl.pathname as TRoute
    const currentPathMinusIdentifier = currentPath.replace(/(.*)\/[^\/]+$/, "$1") as TRoute
    const singleResourceMatch = resources[currentPathMinusIdentifier]
    const allResourceMatch = resources[currentPath]

    if (singleResourceMatch) {
      const identifier = slug[slug.length - 1]
      const [data] = await singleResourceMatch.GET.one(identifier)
      return new Response(JSON.stringify(data))
    }

    if (allResourceMatch) {
      const data = await allResourceMatch.GET.all()
      return new Response(JSON.stringify(data))
    }

    return notFound()
  } catch (error) {
    console.error(error)
    return new Response("Unprocessable content", { status: 422 })
  }
}

export const dynamic = "force-dynamic"
