import { describe, expect, it } from "vitest"

import { opensIn } from "./material-type"

describe("opensIn", () => {
  // "toString" would be found on a plain object lookup; a type nothing can
  // open must not fall through to what the prototype happens to carry.
  it.each(["audiobook_club", "toString"])("opens %s in nothing", materialType => {
    expect(opensIn(materialType)).toBeNull()
  })
})
