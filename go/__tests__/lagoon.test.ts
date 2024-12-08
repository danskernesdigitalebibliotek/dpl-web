import { describe } from "node:test"
import { expect, test } from "vitest"

import { getLagoonUrl } from "@/lib/helpers/lagoon"

describe("Lagoon test suite", () => {
  test("That we can get the node url from Lagoon", async () => {
    const url = getLagoonUrl("node")
    expect(url).toBe("https://node.acme.com")
  })

  test("That we can get the varnish url from Lagoon", async () => {
    const url = getLagoonUrl("varnish")
    expect(url).toBe("https://varnish.acme.com")
  })

  test("That we get undefined if the asked url type does NOT exist", async () => {
    // @ts-ignore
    const url = getLagoonUrl("hannibal")
    expect(url).toBeUndefined()
  })
})
