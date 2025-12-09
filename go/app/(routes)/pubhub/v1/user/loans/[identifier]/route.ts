import { NextRequest, NextResponse, connection } from "next/server"

import { withAuth } from "@/app/(routes)/pubhub/(lib)/helper"
import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"
import { transformTimeToUtcString } from "@/app/(routes)/pubhub/helper"
import { ApiResponseCode } from "@/lib/rest/publizon/local-adapter/generated/model"

import { createLoanRequest } from "./(lib)/requests"
import { createLoanSchema } from "./(lib)/schemas"

const createLoan = createLoanSchema.transform(loanData => {
  const response = loanData.response
  const { expirationdateutc, internalordernumber, retailerordernumber } = response.data || {}
  const { code, message } = response.status

  // Only add the variable if it exists in the response
  return {
    ...(expirationdateutc && { expirationDateUtc: transformTimeToUtcString(expirationdateutc) }),
    ...(internalordernumber && { orderNumber: internalordernumber }),
    ...(retailerordernumber && { orderId: retailerordernumber }),
    code,
    message: `${message} (#${code})`,
  }
})

async function createdigitalLoan(
  request: NextRequest,
  context: { uniLoginUserInfo: TUserInfo; params: { identifier: string } }
) {
  await connection() // Opt into dynamic rendering
  const { identifier } = await context.params

  try {
    const responseData = await createLoanRequest(context.uniLoginUserInfo, identifier)
    const data = createLoan.parse(responseData)

    // Check if the response code is not "101" (OK)
    // https://docs.pubhub.dk/LibraryApi/2.7/Pubhub_Library_Integration_Guide_v2.7_September_2023.pdf
    if (Number(data.code) !== ApiResponseCode.NUMBER_101) {
      return NextResponse.json(data, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("createdigitalLoan error", error)
    throw new Response("Unprocessable content", { status: 422 })
  }
}

export const POST = withAuth(createdigitalLoan)
