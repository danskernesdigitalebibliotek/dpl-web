import { NextRequest, NextResponse } from "next/server"

import { withAuth } from "@/app/(routes)/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"
import { transformTimeToUtcString } from "@/app/(routes)/pubhub/helper"

import { createLoanRequest } from "./(lib)/requests"
import { createLoanSchema } from "./(lib)/schemas"

async function createdigitalLoan(
  request: NextRequest,
  context: { uniLoginUserInfo: TUserInfo; params: { identifier: string } }
) {
  const { identifier } = await context.params
  const createLoan = createLoanSchema.transform(loanData => {
    const response = loanData.response
    return {
      expirationDateUtc: transformTimeToUtcString(response.data?.expirationdateutc || ""),
      orderNumber: response.data?.internalordernumber,
      orderId: response.data?.retailerordernumber,
      code: response.status.code,
      message: `${response.status.message} (#${response.status.code})`,
    }
  })
  try {
    const responseData = await createLoanRequest(context.uniLoginUserInfo, identifier)
    const data = createLoan.parse(responseData)

    // Check if the response code is not "101" (OK)
    // https://docs.pubhub.dk/LibraryApi/2.7/Pubhub_Library_Integration_Guide_v2.7_September_2023.pdf
    if (data.code !== "101") {
      return NextResponse.json(data, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error(error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

export const POST = withAuth(createdigitalLoan)

export const dynamic = "force-dynamic"
