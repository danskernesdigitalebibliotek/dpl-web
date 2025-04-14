import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/pubhub/(lib)/types"
import { transformTimeToUtcString } from "@/app/pubhub/helper"

import { getLibraryUserOrderListRequest } from "./(lib)/requests"
import { libraryUserOrderListSchema } from "./(lib)/schemas"
import { isOrderItem } from "./(lib)/types"

async function getLibraryUserOrder(request: NextRequest, context: { uniLoginUserInfo: TUserInfo }) {
  const { uniLoginUserInfo } = context
  const libraryUserOrderList = libraryUserOrderListSchema.transform(orderListData => {
    const orderListResponse = orderListData.response
    const orderItem = orderListResponse.data.orderitem
    const orderItems = isOrderItem(orderItem) ? [orderItem] : orderItem
    const libraryData = orderListResponse.status.LibraryExtension
    return {
      loans: orderItems.map(orderItem => {
        return {
          orderId: orderItem.internalordernumber,
          orderDateUtc: transformTimeToUtcString(orderItem.orderdate),
          loanExpireDateUtc: transformTimeToUtcString(orderItem.loanexpiredate),
          libraryBook: {
            identifier: orderItem.book.attributes.id,
          },
        }
      }),
      libraryData: {
        maxAmountPerMonth: Number(libraryData.maxloanpertime),
        maxConcurrentAudiobookLoansPerBorrower: Number(libraryData.maxloanpertimesound),
        maxConcurrentEbookLoansPerBorrower: Number(libraryData.maxloanpertime),
      },
      userData: {
        totalLoans: Number(libraryData.usertotalloans),
        totalEbookLoans: Number(libraryData.usertotalebookloans),
        totalAudioLoans: Number(libraryData.usertotalsoundloans),
        ebookLoansRemaining: Number(libraryData.userebookloansremain),
        // There is no direct data field from the SOAP service that gives the remaining amount of audiobooks
        audiobookLoansRemaining:
          Number(libraryData.maxloanpertimesound) - Number(libraryData.usertotalsoundloans),
      },
    }
  })

  try {
    const responseData = await getLibraryUserOrderListRequest(uniLoginUserInfo)
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
