import { z } from "zod"

import type { DigitalMaterial } from "../../../src/types"

// The metadata endpoints return one envelope shape for both the single- and
// batch-lookup routes: `{ materials: [...] }`. Unknown material_ids are
// omitted, so the array can be empty.
//
// Identity (isbn + material_type) is validated strictly. The metadata routes
// only describe what WeDoBooks holds, which is e-materials - physical ones
// come from FBS and FBI and never reach this mapper. The enum is narrower
// than MaterialType in loan.mapper for that reason, and a paper_book here
// means the adapter sent something we do not understand: it throws, the same
// stance as the FBS patron mapper.
//
// The catalogue fields follow the contract too: it requires all of them
// except author, which is the only one parsed as optional.
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
