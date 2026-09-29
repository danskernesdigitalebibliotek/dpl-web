import { z } from "zod"

import type { DigitalSample } from "../../../src/types"

// The contract also returns `material_id`, but it only echoes what was asked
// for - every caller already holds it. Left out so an answer that omits it
// still yields a usable sample.
const GetSampleResponseSchema = z.object({
  format: z.enum(["epub", "mp3"]),
  sample_url: z.string(),
})

export function parseAndMapSample(raw: unknown): DigitalSample {
  const parsed = GetSampleResponseSchema.parse(raw)
  return {
    format: parsed.format,
    url: parsed.sample_url,
  }
}
