import { z } from "zod"

import type { DigitalReservationLimits } from "../../../src/types"
import { ByMaterialTypeSchema } from "./quotas.mapper"

// The response carries a config for both ways of counting; split_on_format
// names the one that applies. Reading loan_config unconditionally would
// report a combined organization's single ceiling once per format.
const GetOrganizationConfigsResponseSchema = z.object({
  organization_configurations: z.object({
    split_on_format: z.boolean(),
    loan_config: z
      .object({ max_concurrent_user_reservations: ByMaterialTypeSchema.optional() })
      .optional(),
  }),
})

export function parseAndMapReservationLimits(raw: unknown): DigitalReservationLimits | null {
  const { organization_configurations: config } = GetOrganizationConfigsResponseSchema.parse(raw)

  return config.split_on_format
    ? (config.loan_config?.max_concurrent_user_reservations ?? null)
    : null
}
