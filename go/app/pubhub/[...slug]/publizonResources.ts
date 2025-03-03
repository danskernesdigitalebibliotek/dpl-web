import { z } from "zod"

import { getDplCmsUniloginConfig } from "@/lib/config/dpl-cms/dplCmsConfig"
import { createClientAsync } from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist"

import { getPublizonServiceParameters } from "./helper"

export const publizonResources = async (uniid: string) => {
  const uniloginConfig = await getDplCmsUniloginConfig()
  const uniloginClientid = uniloginConfig.clientId ?? null

  if (!uniloginClientid) {
    console.error("No unilogin client id found.")
    throw new Response("Internal Server Error", { status: 500 })
  }

  return {
    "/pubhub/v1/user/loans": {
      GET: {
        one: async (identifier: string) => {
          const client = await createClientAsync(
            "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
          )
          return await client.GetLibraryUserOrderAsync({
            ...getPublizonServiceParameters(),
            cardnumber: uniid,
            ebookid: identifier,
          })
        },
        all: async () => {
          const client = await createClientAsync(
            "./lib/soap/publizon/v2_7/wsdl/getlibraryuserorderlist.wsdl"
          )
          const [response] = await client.GetLibraryUserOrderListAsync({
            ...getPublizonServiceParameters(),
            cardnumber: uniid,
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
        },
      },
    },
  }
}

export type TResources = Awaited<ReturnType<typeof publizonResources>>
export type TRoute = keyof TResources
