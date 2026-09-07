import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalLoanQuota, ServiceLayerConfig } from "./types"

export async function getDigitalLoanQuotas(
  config: ServiceLayerConfig
): Promise<DigitalLoanQuota[]> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.getLoanQuotas()
}

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
 * One quota per organization arrives; a patron belongs to a single library
 * in practice, so the first is used - several would need a rule from DBC.
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
  const quota = quotas?.[0]

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
