import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/pubhub/(lib)/types"
import { getLastValueFromUrl, transformTimeToUtcString } from "@/app/pubhub/helper"

import { createLoanRequest } from "./(lib)/requests"
import { createLoanSchema } from "./(lib)/schemas"

async function postLibraryLoan(request: NextRequest, context: { userInfo: TUserInfo }) {
  const createLoan = createLoanSchema.transform(loanData => {
    const response = loanData.response
    return {
      expirationDateUtc: transformTimeToUtcString(response.data.expirationdateutc),
      orderNumber: response.data.internalordernumber,
      orderId: response.data.retailerordernumber,
      code: response.status.code,
      message: `${response.status.message} (#${response.status.code})`,
    }
  })
  try {
    const responseData = await createLoanRequest(context.userInfo, getLastValueFromUrl(request.url))
    return NextResponse.json(createLoan.parse(responseData))
  } catch (error) {
    console.error(error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

// @todo Fix ts problem about context here.
// @ts-ignore
export const POST = withAuth(postLibraryLoan)

export const dynamic = "force-dynamic"
