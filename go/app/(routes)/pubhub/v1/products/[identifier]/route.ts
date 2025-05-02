import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/(routes)/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"

import { getProductsRequest } from "./(lib)/requests"
import { getProductsSchema } from "./(lib)/schemas"

async function getProducts(
  request: NextRequest,
  context: { uniLoginUserInfo: TUserInfo; params: { identifier: string } }
) {
  const params = await context.params
  const identifier = params.identifier
  const getProduct = getProductsSchema.transform(productData => {
    const response = productData.response
    return {
      code: response.status.code,
      message: response.status.message,
      product: {
        title: response.data.title,
        description: response.data.description,
        costFree: response.costfree,
      },
    }
  })
  try {
    const responseData = await getProductsRequest(context.uniLoginUserInfo, identifier)
    return NextResponse.json(getProduct.parse(responseData))
  } catch (error) {
    console.error(error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

// @ts-ignore
export const GET = withAuth(getProducts)

export const dynamic = "force-dynamic"
