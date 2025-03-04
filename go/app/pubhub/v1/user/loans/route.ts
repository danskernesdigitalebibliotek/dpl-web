import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/pubhub/(lib)/types"

import { getLibraryUserOrderListRequest } from "./(lib)/requests"
import { libraryUserOrderListSchema } from "./(lib)/schemas"
import { isOrderItem } from "./(lib)/types"

async function getLibraryUserOrder(request: NextRequest, context: { userInfo: TUserInfo }) {
  const { userInfo } = context
  const libraryUserOrderList = libraryUserOrderListSchema.transform(orderListData => {
    const orderListResponse = orderListData.response
    const orderItem = orderListResponse.data.orderitem
    const orderItems = isOrderItem(orderItem) ? [orderItem] : orderItem
    return {
      loans: orderItems.map(orderItem => {
        return {
          orderId: orderItem.retailerordernumber,
          orderDateUtc: orderItem.orderdate,
          loanExpireDateUtc: orderItem.loanexpiredate,
          libraryBook: {
            identifier: orderItem.book.attributes.id,
          },
        }
      }),
      userData: {
        totalLoans: orderListResponse.status.LibraryExtension.usertotalloans,
        totalEbookLoans: orderListResponse.status.LibraryExtension.usertotalebookloans,
        totalAudioLoans: orderListResponse.status.LibraryExtension.usertotalsoundloans,
      },
    }
  })

  try {
    const responseData = await getLibraryUserOrderListRequest(userInfo)
    return NextResponse.json(libraryUserOrderList.parse(responseData))
  } catch (error) {
    console.error(error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

// @todo Fix ts problem about context here.
// @ts-ignore
export const GET = withAuth(getLibraryUserOrder)

export const dynamic = "force-dynamic"
