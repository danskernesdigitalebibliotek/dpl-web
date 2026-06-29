import { expect, test } from "vitest"

import { getEbookManifestationOrFallbackManifestation } from "@/components/pages/workPageLayout/helper"
import { ManifestationWorkPageFragment } from "@/lib/graphql/generated/fbi/graphql"

const ebook = (pid: string, identifierType: "ISBN" | "PUBLIZON", value: string) =>
  ({
    pid,
    materialTypes: [{ materialTypeSpecific: { code: "EBOOK" } }],
    identifiers: [{ type: identifierType, value }],
  }) as unknown as ManifestationWorkPageFragment

test("prefers the e-book edition that has a PUBLIZON identifier", () => {
  // A deselected PDF (ISBN only) listed before the loanable EPUB (PUBLIZON).
  // The selector must skip the PDF.
  const pdf = ebook("870970-basis:pdf", "ISBN", "9788797287996")
  const epub = ebook("870970-basis:epub", "PUBLIZON", "9788797577646")

  const result = getEbookManifestationOrFallbackManifestation(pdf, [pdf, epub])

  expect(result.pid).toBe("870970-basis:epub")
})

test("falls back to the first e-book edition when none has a PUBLIZON identifier", () => {
  const first = ebook("870970-basis:first", "ISBN", "9788797287996")
  const second = ebook("870970-basis:second", "ISBN", "9788797287997")

  const result = getEbookManifestationOrFallbackManifestation(first, [first, second])

  expect(result.pid).toBe("870970-basis:first")
})
