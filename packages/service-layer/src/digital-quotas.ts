import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { DigitalLoanQuota, ServiceLayerConfig } from "./types"

// One quota per organization. A patron belongs to a single library in
// practice - see getDigitalLoanQuota for how a format's numbers are read out.
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
 * availability texts talk about loans "this month", while the profile page
 * shows how many loans the user holds right now. Organizations either count
 * e-books and audiobooks together or split them per format.
 *
 * The adapter returns one quota per organization. A patron belongs to a
 * single library in practice, so the first one is used - if a patron can ever
 * belong to several, this needs a rule from DBC.
 *
 * Cost-free loans draw on no quota, and the adapter's counters exclude them
 * at the source - confirmed by WeDoBooks, and verified against the real
 * adapter by borrowing a blue (selection-licence) title and watching the
 * counters stand still, then a click-licence title and watching them move. So
 * unlike the Publizon path, which subtracts its subscription loans itself,
 * the numbers are used as they arrive.
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
