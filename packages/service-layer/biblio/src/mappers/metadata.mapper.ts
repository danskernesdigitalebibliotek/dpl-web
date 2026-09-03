import { z } from "zod"

import type { DigitalMaterial } from "../../../src/types"

// Both metadata routes answer `{ materials: [...] }`; unknown ids are omitted,
// so the array can be empty. The type enum is narrower than MaterialTypeSchema
// in loan.mapper because the metadata routes only describe WeDoBooks' own
// e-materials - a paper_book here is a contract breach and throws.
const MaterialInformationSchema = z.object({
  isbn: z.string(),
  material_type: z.enum(["ebook", "audiobook"]),
  title: z.string(),
  author: z.array(z.string()).optional(),
  description: z.string(),
  publish_date: z.string(),
  languages: z.array(z.string()),
})

const GetMetadataResponseSchema = z.object({
  materials: z.array(MaterialInformationSchema),
})

export function parseAndMapMetadata(raw: unknown): DigitalMaterial | undefined {
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
