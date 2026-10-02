import { z } from "zod"

import type { DigitalMaterial } from "../../../src/types"
import { ImportMaterialType } from "../generated/model"
import { openStringUnion } from "./open-string-union"

// Both metadata routes answer `{ materials: [...] }`; unknown ids are omitted,
// so the array can be empty. The metadata routes only describe WeDoBooks' own
// e-materials, so anything but ebook | audiobook is logged - see openStringUnion.
const MaterialInformationSchema = z.object({
  isbn: z.string(),
  material_type: openStringUnion("material_type", Object.values(ImportMaterialType)),
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
