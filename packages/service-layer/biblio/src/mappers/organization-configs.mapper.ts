import { z } from "zod"

import type { DigitalReservationLimits } from "../../../src/types"
import { ByMaterialTypeSchema } from "./quotas.mapper"

// The organization config carries both shapes at all times and names which
// one applies in split_on_format - unlike the loan quotas, where the two are
// discriminated unions of their own. Only the reservation ceiling is read
// from it: everything else the UI needs about limits already comes with the
// patron's quotas, and a field parsed here would be one to keep working.
//
// The ceiling itself is optional by contract, so an organization that
// configures none parses fine and reports undefined.
const CombinedLoanConfigSchema = z.object({
  max_concurrent_user_reservations: z.number().optional(),
})

const SplitLoanConfigSchema = z.object({
  max_concurrent_user_reservations: ByMaterialTypeSchema.optional(),
})

const GetOrganizationConfigsResponseSchema = z.object({
  organization_configurations: z.object({
    split_on_format: z.boolean(),
    combined_loan_config: CombinedLoanConfigSchema,
    loan_config: SplitLoanConfigSchema,
  }),
})

export function parseAndMapReservationLimits(raw: unknown): DigitalReservationLimits {
  const { organization_configurations: configs } = GetOrganizationConfigsResponseSchema.parse(raw)

  if (configs.split_on_format) {
    return {
      splitOnFormat: true,
      maxConcurrentReservations: configs.loan_config.max_concurrent_user_reservations,
    }
  }

  return {
    splitOnFormat: false,
    maxConcurrentReservations: configs.combined_loan_config.max_concurrent_user_reservations,
  }
}
