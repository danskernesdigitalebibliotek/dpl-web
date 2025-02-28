import { notFound } from "next/navigation"
import { NextRequest } from "next/server"

import { TRoute, getPublizonResources } from "./helper"

export async function GET(request: NextRequest) {
  const currentPath = request.nextUrl.pathname as TRoute
  const resources = await getPublizonResources()
  const resource = resources[currentPath]
  if (!resource) {
    return notFound()
  }

  // @todo Support loading identifier as well.
  const [data] = await resource.GET.all()
  return new Response(JSON.stringify(data))
}

export const dynamic = "force-dynamic"
