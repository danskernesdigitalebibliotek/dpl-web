import { notFound } from "next/navigation"
import { NextRequest } from "next/server"

import { TRoute, getPublizonResources } from "./helper"

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ slug: string }>
  }
) {
  const slug = (await params).slug
  const cardNumber = process.env.TMP_PUBLIZON_GET_LIBRARY_USER_ORDER_LIST_CARD_NUMBER ?? ""
  const resources = await getPublizonResources(cardNumber)
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
    const [data] = await allResourceMatch.GET.all()
    return new Response(JSON.stringify(data))
  }

  return notFound()
}

export const dynamic = "force-dynamic"
