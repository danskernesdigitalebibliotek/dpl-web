import { testApiHandler } from "next-test-api-route-handler"
import { describe, expect, it } from "vitest"

import { getV1UserLoansSoapData } from "@/__tests__/mocks/pubhub"
import * as createLoanEndpoint from "@/app/(routes)/pubhub/v1/user/loans/[identifier]/route"
import * as apiEndpoint from "@/app/(routes)/pubhub/v1/user/loans/route"
import * as sessionFunctions from "@/lib/session/session"
import * as createLoanClientFunctions from "@/lib/soap/publizon/v2_7/generated/createloan/client"
import * as clientFunctions from "@/lib/soap/publizon/v2_7/generated/getlibraryuserorderlist/client"

import { testSilently } from "./helpers"

describe("Pubhub local API", () => {
  testSilently("Returns unauthorized for anonymous user at GET /v1/user/loans", async () => {
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
        uniLoginUserInfo: { uniid: "100006cbab", institutionIds: ["R00263"] },
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
        uniLoginUserInfo: { uniid: "100006cbab", institutionIds: ["R00263"] },
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

  // Adgangsplatformen can log in a student without institutions. The login
  // stands, but a loan is refused without calling Publizon.
  testSilently("Refuses a loan for a user without institutions", async () => {
    vi.spyOn(sessionFunctions, "getSession").mockResolvedValue(
      // @ts-ignore
      Promise.resolve({
        isLoggedIn: true,
        type: "unilogin",
        uniLoginUserInfo: { uniid: "100006cbab", institutionIds: [] },
      })
    )
    const CreateLoanAsync = vi.fn()
    vi.spyOn(createLoanClientFunctions, "createClientAsync").mockResolvedValue(
      // @ts-ignore
      Promise.resolve({ CreateLoanAsync })
    )
    await testApiHandler({
      // @ts-ignore
      appHandler: createLoanEndpoint,
      params: { identifier: "9788711668016" },
      url: "/pubhub/v1/user/loans/9788711668016",
      async test({ fetch }) {
        const res = await fetch({ method: "POST" })
        expect(res.status).toBeGreaterThanOrEqual(400)
      },
    })
    expect(CreateLoanAsync).not.toHaveBeenCalled()
  })
})
