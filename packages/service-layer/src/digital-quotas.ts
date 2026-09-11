import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalLoanQuota, DigitalReservationLimits, ServiceLayerConfig } from "./types"

export async function getDigitalLoanQuotas(
  config: ServiceLayerConfig
): Promise<DigitalLoanQuota[]> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getLoanQuotas()
}

// One quota arrives per organization the patron belongs to; in practice that
// is a single library, so the first is it - several would need a rule from
// DBC. Both callers below key on that same rule.
const patronQuota = (quotas: DigitalLoanQuota[] | undefined) => quotas?.[0]

export const getDigitalQuotaOrganizationId = (
  quotas: DigitalLoanQuota[] | undefined
): string | null => patronQuota(quotas)?.orgId ?? null

export type QuotaUsage = {
  current: number
  limit: number | undefined
}

/**
 * The user's loan quota for a format.
 *
 * Biblio counts loans two ways and the consumers need different ones: the
 * availability texts talk about loans "this month", the profile page about
 * loans held right now. Organizations either combine e-books and audiobooks
 * or split them per format.
 *
 * Cost-free loans draw on no quota and the adapter's counters already exclude
 * them (confirmed by WeDoBooks), so unlike the Publizon path nothing is
 * subtracted here.
 */
export const getDigitalLoanQuota = ({
  quotas,
  format,
  period = "monthly",
}: {
  quotas: DigitalLoanQuota[] | undefined
  format: "ebook" | "audiobook"
  period?: "monthly" | "concurrent"
}): QuotaUsage => {
  const quota = patronQuota(quotas)

  if (!quota) {
    return { current: 0, limit: undefined }
  }

  if (quota.splitOnFormat) {
    return period === "concurrent"
      ? {
          current: quota.currentConcurrentLoans[format],
          limit: quota.maxConcurrentLoans[format],
        }
      : {
          current: quota.currentMonthlyLoans[format],
          limit: quota.maxLoans[format],
        }
  }

  return period === "concurrent"
    ? {
        current: quota.currentConcurrentLoans,
        limit: quota.maxConcurrentLoans,
      }
    : {
        current: quota.currentMonthlyLoans,
        limit: quota.maxLoans,
      }
}

export async function getDigitalReservationLimits(
  config: ServiceLayerConfig,
  organizationId: string
): Promise<DigitalReservationLimits | null> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getReservationLimits(organizationId)
}
