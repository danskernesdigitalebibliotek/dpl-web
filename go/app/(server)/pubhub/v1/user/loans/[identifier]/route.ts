import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/pubhub/(lib)/types"
import { transformTimeToUtcString } from "@/app/pubhub/helper"

import { createLoanRequest } from "./(lib)/requests"
import { createLoanSchema } from "./(lib)/schemas"

async function createdigitalLoan(
  request: NextRequest,
  context: { uniLoginUserInfo: TUserInfo; params: { identifier: string } }
) {
  const { identifier } = context.params
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
    const responseData = await createLoanRequest(context.uniLoginUserInfo, identifier)
    return NextResponse.json(createLoan.parse(responseData))
  } catch (error) {
    console.error(error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

// @todo Fix ts problem about context here.
// @ts-ignore
export const POST = withAuth(createdigitalLoan)

export const dynamic = "force-dynamic"
