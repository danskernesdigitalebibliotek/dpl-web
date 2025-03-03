import { notFound } from "next/navigation"
import { NextRequest } from "next/server"
import { z } from "zod"

import { getPublizonServiceParameters } from "@/app/pubhub/helper"
import { getSession } from "@/lib/session/session"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

export async function GET() {
  const session = await getSession()

  try {
    z.object({
      isLoggedIn: z.literal(true),
      type: z.literal("unilogin"),
    }).parse(session)
  } catch (error) {
    console.error(error)
    return new Response("Not Authorized", { status: 401 })
  }

  try {
    const userInfo = z
      .object({
        uniid: z.string(),
        institution_ids: z.string().regex(/^\[.+\]+$/),
      })
      .parse(session?.userInfo)

    const client = await createClientAsync(
      "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
    )
    const [response] = await client.GetLibraryUserOrderListAsync({
      ...getPublizonServiceParameters(),
      cardnumber: userInfo.uniid,
    })
    const responseData = response.GetLibraryUserOrderListResult
    const orderItem = z.object({
      book: z.object({
        attributes: z.object({
          id: z.string(),
        }),
      }),
    })
    const libraryUserOrderListSchema = z
      .object({
        response: z.object({
          data: z.object({
            orderitem: z.array(orderItem),
          }),
        }),
      })
      .transform(responseData => {
        const orderItems = responseData.response.data.orderitem
        return {
          loans: orderItems.map(orderItem => {
            return {
              libraryBook: {
                // TODO: type this properly
                // @ts-ignore
                identifier: orderItem.book.attributes.id,
              },
            }
          }),
        }
      })

    try {
      return libraryUserOrderListSchema.parse(responseData)
    } catch (error) {
      console.error(error)
      throw new Response("Unprocessable content", { status: 422 })
    }
  } catch (error) {
    console.error(error)
    return new Response("Unprocessable content", { status: 422 })
  }
}

export const dynamic = "force-dynamic"
