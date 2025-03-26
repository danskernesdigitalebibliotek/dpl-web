// @vitest-environment node
import { cookies } from "next/headers"
import { describe, expect, it, vi } from "vitest"

import goConfig from "@/lib/config/goConfig"
import { libraryTokenExist } from "@/lib/helpers/tokens"

vi.mock("next/headers", () => {
  const original = vi.importActual("next/headers")
  return {
    ...original,
    cookies: vi.fn(),
  }
})

describe("libraryTokenExist()", async () => {
  it("tells us if a library token does not exist", async () => {
    // @ts-ignore
    cookies.mockResolvedValue(
      Promise.resolve({
        get: () => {
          return null
        },
      })
    )

    const tokenExists = await libraryTokenExist()
    expect(tokenExists).toBe(false)
  })

  it("tells us if a library token exists", async () => {
    // @ts-ignore
    cookies.mockResolvedValue(
      Promise.resolve({
        get: (name: string) => {
          if (name === goConfig("library-token.cookie-name")) {
            return "1234"
          }
          return null
        },
      })
    )

    const tokenExists = await libraryTokenExist()
    expect(tokenExists).toBe(true)
  })
})
