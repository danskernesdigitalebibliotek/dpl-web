// @vitest-environment node
import { testApiHandler } from "next-test-api-route-handler"
import { revalidatePath, revalidateTag } from "next/cache"
import { describe, expect, test } from "vitest"

import * as revalidateCacheHandler from "@/app/(routes)/cache/revalidate/route"

import { testSilently } from "./helpers"

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

beforeEach(() => {
  // Mock the revalidatePath and revalidateTag functions
  // @ts-ignore
  revalidatePath.mockReturnValue(true)
  // @ts-ignore
  revalidateTag.mockReturnValue(true)
})

describe("Revalidate cache endpoint", () => {
  testSilently(
    "That the cache revalidation endpoint returns 400 if secret is missing",
    async () => {
      await testApiHandler({
        appHandler: revalidateCacheHandler,
        url: `/cache/revalidate?tags=tag1,tag2`,
        async test({ fetch }) {
          await expect((await fetch()).json()).resolves.toStrictEqual({
            error: "Bad Request",
          })
          expect((await fetch()).status).toBe(400)
        },
      })
    }
  )

  testSilently(
    "That the cache revalidation endpoint returns 400 if both tags and path are missing",
    async () => {
      await testApiHandler({
        appHandler: revalidateCacheHandler,
        url: `/cache/revalidate?secret=abe`,
        async test({ fetch }) {
          await expect((await fetch()).json()).resolves.toStrictEqual({
            error: "Bad Request",
          })
          expect((await fetch()).status).toBe(400)
        },
      })
    }
  )
  test("That the cache revalidation endpoint returns 401 if path is provided but secret is wrong", async () => {
    await testApiHandler({
      appHandler: revalidateCacheHandler,
      url: `/cache/revalidate?secret=abe&path=/some/path`,
      async test({ fetch }) {
        await expect((await fetch()).json()).resolves.toStrictEqual({
          error: "Not authorized",
        })
        expect((await fetch()).status).toBe(401)
      },
    })
  })
  test("That the cache revalidation endpoint returns 401 if tags are provided but secret is wrong", async () => {
    await testApiHandler({
      appHandler: revalidateCacheHandler,
      url: `/cache/revalidate?secret=abe&tags=tag1,tag2`,
      async test({ fetch }) {
        await expect((await fetch()).json()).resolves.toStrictEqual({
          error: "Not authorized",
        })
        expect((await fetch()).status).toBe(401)
      },
    })
  })
  test("That the cache revalidation endpoint returns 200 if secret is right and path is provided", async () => {
    await testApiHandler({
      appHandler: revalidateCacheHandler,
      url: `/cache/revalidate?secret=CeXF8E2Rd9wXZ2sswFHR&path=/some/path`,
      async test({ fetch }) {
        await expect((await fetch()).json()).resolves.toStrictEqual({
          message: "Revalidation successful",
        })
        expect((await fetch()).status).toBe(200)
      },
    })
  })
  test("That the cache revalidation endpoint returns 200 if secret is right and tags are provided", async () => {
    await testApiHandler({
      appHandler: revalidateCacheHandler,
      url: `/cache/revalidate?secret=CeXF8E2Rd9wXZ2sswFHR&tags=tag1,tag2`,
      async test({ fetch }) {
        await expect((await fetch()).json()).resolves.toStrictEqual({
          message: "Revalidation successful",
        })
        expect((await fetch()).status).toBe(200)
      },
    })
  })
})
