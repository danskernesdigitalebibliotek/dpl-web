import { z } from "zod"

import type { BiblioMaterial } from "../../../src/types"

// The metadata endpoints return one envelope shape for both the single- and
// batch-lookup routes: `{ materials: [...] }`. Unknown material_ids are
// omitted, so the array can be empty. We only read the two fields a consumer
// needs today (isbn + material_type); the adapter's ImportMaterialType is
// restricted to ebook | audiobook, so a physical material would fail
// validation here by design — the same "throw on the unexpected" stance as the
// FBS patron mapper.
const MaterialInformationSchema = z.object({
  isbn: z.string(),
  material_type: z.enum(["ebook", "audiobook"]),
})

const GetMetadataResponseSchema = z.object({
  materials: z.array(MaterialInformationSchema),
})

export function parseAndMapMetadata(raw: unknown): BiblioMaterial | undefined {
  const parsed = GetMetadataResponseSchema.parse(raw)
  const material = parsed.materials[0]
  if (!material) return undefined
  return {
    isbn: material.isbn,
    materialType: material.material_type,
  }
}
