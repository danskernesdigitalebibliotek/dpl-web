import { z } from "zod"

import type { DigitalLoanQuota } from "../../../src/types"

const ByMaterialTypeSchema = z.object({
  ebook: z.number(),
  audiobook: z.number(),
})

// Organizations either count e-books and audiobooks together (combined) or
// separately (split on format). The two shapes are discriminated by
// split_on_format.
const CombinedQuotaSchema = z.object({
  split_on_format: z.literal(false),
  org_id: z.string(),
  org_name: z.string(),
  combined_max_user_loans: z.number(),
  combined_max_concurrent_user_loans: z.number(),
  combined_current_concurrent_loans: z.number(),
  combined_current_monthly_loans: z.number(),
})

const SplitQuotaSchema = z.object({
  split_on_format: z.literal(true),
  org_id: z.string(),
  org_name: z.string(),
  max_user_loans: ByMaterialTypeSchema,
  max_concurrent_user_loans: ByMaterialTypeSchema,
  current_concurrent_loans: ByMaterialTypeSchema,
  current_monthly_loans: ByMaterialTypeSchema,
})

const GetLoanQuotasResponseSchema = z.object({
  loan_quotas: z.array(
    z.discriminatedUnion("split_on_format", [CombinedQuotaSchema, SplitQuotaSchema])
  ),
})

export function parseAndMapLoanQuotas(raw: unknown): DigitalLoanQuota[] {
  const parsed = GetLoanQuotasResponseSchema.parse(raw)
  return parsed.loan_quotas.map(quota => {
    if (quota.split_on_format) {
      return {
        splitOnFormat: true,
        orgId: quota.org_id,
        orgName: quota.org_name,
        maxLoans: quota.max_user_loans,
        maxConcurrentLoans: quota.max_concurrent_user_loans,
        currentConcurrentLoans: quota.current_concurrent_loans,
        currentMonthlyLoans: quota.current_monthly_loans,
      }
    }
    return {
      splitOnFormat: false,
      orgId: quota.org_id,
      orgName: quota.org_name,
      maxLoans: quota.combined_max_user_loans,
      maxConcurrentLoans: quota.combined_max_concurrent_user_loans,
      currentConcurrentLoans: quota.combined_current_concurrent_loans,
      currentMonthlyLoans: quota.combined_current_monthly_loans,
    }
  })
}
