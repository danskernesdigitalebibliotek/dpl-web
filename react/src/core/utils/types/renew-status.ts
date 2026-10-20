// The members mirror the renewal status values the FBS API can return.
// Only "renewed" is referenced in code, but the remaining values document
// the API domain and may arrive at runtime.
export enum RenewStatus {
  renewed = "renewed",
  /** @knip-ignore */
  deniedReserved = "deniedReserved",
  /** @knip-ignore */
  deniedMaxRenewalsReached = "deniedMaxRenewalsReached",
  /** @knip-ignore */
  deniedLoanerIsBlocked = "deniedLoanerIsBlocked",
  /** @knip-ignore */
  deniedMaterialIsNotLoanable = "deniedMaterialIsNotLoanable",
  /** @knip-ignore */
  deniedMaterialIsNotFound = "deniedMaterialIsNotFound",
  /** @knip-ignore */
  deniedLoanerNotFound = "deniedLoanerNotFound",
  /** @knip-ignore */
  deniedLoaningProfileNotFound = "deniedLoaningProfileNotFound",
  /** @knip-ignore */
  deniedOtherReason = "deniedOtherReason"
}
