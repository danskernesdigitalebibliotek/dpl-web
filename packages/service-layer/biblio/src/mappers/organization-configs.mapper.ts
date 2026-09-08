import { z } from "zod"

import type { DigitalReservationLimits } from "../../../src/types"
import { ByMaterialTypeSchema } from "./quotas.mapper"

// Only the per-format reservation ceiling is read from the organization
// config: everything else the UI needs about limits already comes with the
// patron's quotas, and a field parsed here would be one more to keep working.
//
// split_on_format names which of the two loan configs the organization runs
// on, and an organization that counts the formats together has no shape the
// consumers can render - so that branch is recognised by the flag alone and
// its config is neither required nor read. The ceiling is optional by
// contract, so an organization that configures none parses fine too.
const GetOrganizationConfigsResponseSchema = z.object({
  organization_configurations: z.discriminatedUnion("split_on_format", [
    z.object({
      split_on_format: z.literal(true),
      loan_config: z.object({
        max_concurrent_user_reservations: ByMaterialTypeSchema.optional(),
      }),
    }),
    z.object({
      split_on_format: z.literal(false),
    }),
  ]),
})

export function parseAndMapReservationLimits(raw: unknown): DigitalReservationLimits | null {
  const { organization_configurations: configs } = GetOrganizationConfigsResponseSchema.parse(raw)

  if (!configs.split_on_format) {
    return null
  }

  return configs.loan_config.max_concurrent_user_reservations ?? null
}
