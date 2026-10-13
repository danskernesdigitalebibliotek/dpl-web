import { z } from "zod"

import type { DigitalSample } from "../../../src/types"
import { SampleFormat } from "../generated/model"

// The contract also returns `material_id`, but it only echoes what was asked
// for - every caller already holds it. Left out so an answer that omits it
// still yields a usable sample.
const GetSampleResponseSchema = z.object({
  // Closed on purpose, unlike the loan enums: a file format nothing can play
  // fails only this one sample, and passing it on would just fail later.
  format: z.enum(SampleFormat),
  sample_url: z.string(),
})

export function parseAndMapSample(raw: unknown): DigitalSample {
  const parsed = GetSampleResponseSchema.parse(raw)
  return {
    format: parsed.format,
    url: parsed.sample_url,
  }
}
