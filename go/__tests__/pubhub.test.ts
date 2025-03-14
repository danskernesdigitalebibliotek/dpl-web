// TODO: Test that the local adapter's output is the same as the adapter's output
// We need two users with the same one loan
// Mock soap service output
// Copy output from the adapter and use it as assertion that our local adapter returns the same data
// We can use vitest snapshot of our local adapter's response for this
import { IronSession } from "iron-session"
import { testApiHandler } from "next-test-api-route-handler"
import { describe, expect, it } from "vitest"

import { getV1UserLoansSoapData } from "@/__tests__/mocks/pubhub"
import * as xyz from "@/app/pubhub/v1/user/loans/(lib)/requests"
import * as apiEndpoint from "@/app/pubhub/v1/user/loans/route"
import { withSessionType } from "@/lib/rest/publizon/helper"
import * as sessionFunctions from "@/lib/session/session"
import { TSessionData } from "@/lib/session/session"
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
        userInfo: { uniid: "100006cbab", institution_ids: ["A04441"] },
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
        userInfo: { uniid: "100006cbab", institution_ids: ["A04441"] },
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
