import { z } from "zod"

import type { DigitalReservationLimits } from "../../../src/types"
import { ByMaterialTypeSchema } from "./quotas.mapper"

// split_on_format names which of the two loan configs the organization runs
// on - the response carries both, so reading loan_config unconditionally
// would report a combined ceiling per format. Only the reservation ceiling is
// read; everything else about limits already comes with the patron's quotas.
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
