import type { AgencyBranch } from "../generated/model/agencyBranch"
import type { Branch } from "../types"

export function mapBranch(raw: AgencyBranch): Branch {
  return {
    branchId: raw.branchId,
    title: raw.title,
  }
}
