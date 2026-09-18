import { describe, expect, it } from "vitest"

import { addOperationNameToUrl } from "@/lib/helpers/graphql"

describe("addOperationNameToUrl", () => {
  it("should append the operation name of a query", () => {
    expect(
      addOperationNameToUrl(
        "https://fbi.dk/graphql",
        "query GetCoversByPids($pids: [String!]!) { ... }"
      )
    ).toEqual("https://fbi.dk/graphql?GetCoversByPids")
  })

  it("should append the operation name of a mutation", () => {
    expect(
      addOperationNameToUrl(
        "https://fbi.dk/graphql",
        "\n    mutation openOrder($input: SubmitOrder!) { ... }"
      )
    ).toEqual("https://fbi.dk/graphql?openOrder")
  })

  it("should append to an url which already has query parameters", () => {
    expect(addOperationNameToUrl("https://fbi.dk/graphql?foo=bar", "query Baz { }")).toEqual(
      "https://fbi.dk/graphql?foo=bar&Baz"
    )
  })

  it("should leave the url untouched for anonymous operations", () => {
    expect(addOperationNameToUrl("https://fbi.dk/graphql", "{ foo }")).toEqual(
      "https://fbi.dk/graphql"
    )
  })
})
