import { z } from "zod"

import type { BiblioSignInToken } from "../../../src/types"

const GetSupportIdResponseSchema = z.object({
  support_id: z.string(),
})

const CreateSignInTokenResponseSchema = z.object({
  token: z.string(),
  expires_in_seconds: z.number(),
})

export function parseAndMapSupportId(raw: unknown): string {
  return GetSupportIdResponseSchema.parse(raw).support_id
}

export function parseAndMapSignInToken(raw: unknown): BiblioSignInToken {
  const parsed = CreateSignInTokenResponseSchema.parse(raw)
  return {
    token: parsed.token,
    expiresInSeconds: parsed.expires_in_seconds,
  }
}
