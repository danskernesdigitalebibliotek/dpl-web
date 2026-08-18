import { z } from "zod"

import type { BiblioMaterial } from "../../../src/types"

// The metadata endpoints return one envelope shape for both the single- and
// batch-lookup routes: `{ materials: [...] }`. Unknown material_ids are
// omitted, so the array can be empty.
//
// Identity (isbn + material_type) is validated strictly: the adapter's
// ImportMaterialType is restricted to ebook | audiobook, so a physical
// material fails validation here by design — the same "throw on the
// unexpected" stance as the FBS patron mapper.
//
// The catalogue fields are presentation only. The contract marks most of them
// required, but they are optional here on purpose: a record missing its
// description should render an incomplete material rather than break the
// whole list it appears in.
const MaterialInformationSchema = z.object({
  isbn: z.string(),
  material_type: z.enum(["ebook", "audiobook"]),
  title: z.string().optional(),
  author: z.array(z.string()).optional(),
  description: z.string().optional(),
  publish_date: z.string().optional(),
  languages: z.array(z.string()).optional(),
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
    title: material.title,
    authors: material.author ?? [],
    description: material.description,
    publishDate: material.publish_date,
    languages: material.languages ?? [],
  }
}
