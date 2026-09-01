import { createFbsClient } from "../fbs/src"
import { resolveFbsConfig } from "./internal/resolveFbsConfig"
import type { Loan, RenewedLoan, ServiceLayerConfig } from "./types"

export async function getLoans(config: ServiceLayerConfig): Promise<Loan[]> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.getLoans()
}

export async function renewLoans(
  config: ServiceLayerConfig,
  loanIds: number[]
): Promise<RenewedLoan[]> {
  const fbs = createFbsClient(resolveFbsConfig(config))
  return fbs.renewLoans(loanIds)
}
