// The members mirror the renewal status values the FBS API can return.
// Only "renewed" is referenced in code, but the remaining values document
// the API domain and may arrive at runtime.
export enum RenewStatus {
  renewed = "renewed",
  /** @lintignore */
  deniedReserved = "deniedReserved",
  /** @lintignore */
  deniedMaxRenewalsReached = "deniedMaxRenewalsReached",
  /** @lintignore */
  deniedLoanerIsBlocked = "deniedLoanerIsBlocked",
  /** @lintignore */
  deniedMaterialIsNotLoanable = "deniedMaterialIsNotLoanable",
  /** @lintignore */
  deniedMaterialIsNotFound = "deniedMaterialIsNotFound",
  /** @lintignore */
  deniedLoanerNotFound = "deniedLoanerNotFound",
  /** @lintignore */
  deniedLoaningProfileNotFound = "deniedLoaningProfileNotFound",
  /** @lintignore */
  deniedOtherReason = "deniedOtherReason"
}
