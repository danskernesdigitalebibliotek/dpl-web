import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/pubhub/(lib)/types"

import { getLibraryUserOrderListRequest } from "./(lib)/requests"
import { libraryUserOrderListSchema } from "./(lib)/schemas"
import { isOrderItem } from "./(lib)/types"

async function getLibraryUserOrder(request: NextRequest, context: { userInfo: TUserInfo }) {
  const { userInfo } = context
  try {
    const responseData = await getLibraryUserOrderListRequest(userInfo)
    const libraryUserOrderList = libraryUserOrderListSchema.transform(orderListData => {
      const orderItem = orderListData.response.data.orderitem
      const orderItems = isOrderItem(orderItem) ? [orderItem] : orderItem
      return {
        loans: orderItems.map(orderItem => {
          return {
            libraryBook: {
              identifier: orderItem.book.attributes.id,
            },
          }
        }),
      }
    })

    try {
      return NextResponse.json(libraryUserOrderList.parse(responseData))
    } catch (error) {
      console.error(error)
      throw new Response("Unprocessable content", { status: 422 })
    }
  } catch (error) {
    console.error(error)
    return new Response("Unprocessable content", { status: 422 })
  }
}

export const GET = withAuth(getLibraryUserOrder)

export const dynamic = "force-dynamic"
