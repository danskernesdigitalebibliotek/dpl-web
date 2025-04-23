import { testApiHandler } from "next-test-api-route-handler"
import { describe, expect, it } from "vitest"

import { getV1UserLoansSoapData } from "@/__tests__/mocks/pubhub"
import * as apiEndpoint from "@/app/pubhub/v1/user/loans/route"
import * as sessionFunctions from "@/lib/session/session"
import * as clientFunctions from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist/client"

describe("Pubhub local API", () => {
  it("Returns unauthorized for anonymous user at GET /v1/user/loans", async () => {
    await testApiHandler({
      // @ts-ignore
      appHandler: apiEndpoint,
      url: "/pubhub/v1/user/loans",
      async test({ fetch }) {
        const res = await fetch({ method: "GET" })
        expect(res.status).equal(401)
      },
    })
  })

  it("Returns authorized for logged in users at GET /v1/user/loans", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      // @ts-ignore
      Promise.resolve({
        isLoggedIn: true,
        type: "unilogin",
        uniLoginUserInfo: { uniid: "100006cbab", institution_ids: ["A04441"] },
      })
    )
    vi.spyOn(clientFunctions, "createClientAsync").mockResolvedValue(
      // @ts-ignore
      Promise.resolve({
        GetLibraryUserOrderListAsync: async () => {
          return Promise.resolve([getV1UserLoansSoapData])
        },
      })
    )
    await testApiHandler({
      // @ts-ignore
      appHandler: apiEndpoint,
      url: "/pubhub/v1/user/loans",
      async test({ fetch }) {
        const res = await fetch({ method: "GET" })
        expect(res.status).equal(200)
      },
    })
  })

  it("Returns same output from local & external GET /v1/user/loans", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      // @ts-ignore
      Promise.resolve({
        isLoggedIn: true,
        type: "unilogin",
        uniLoginUserInfo: { uniid: "100006cbab", institution_ids: ["A04441"] },
      })
    )
    vi.spyOn(clientFunctions, "createClientAsync").mockResolvedValue(
      // @ts-ignore
      Promise.resolve({
        GetLibraryUserOrderListAsync: async () => {
          return Promise.resolve([getV1UserLoansSoapData])
        },
      })
    )
    await testApiHandler({
      // @ts-ignore
      appHandler: apiEndpoint,
      url: "/pubhub/v1/user/loans",
      async test({ fetch }) {
        const res = await fetch({ method: "GET" })
        const data = await res.json()
        expect(data).toMatchSnapshot()
      },
    })
  })
})
