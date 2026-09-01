import { type Fee } from "@danskernesdigitalebibliotek/dpl-service-layer"

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("da-DK", { maximumFractionDigits: 2 }).format(amount)

// Buckets the patron's unpaid FBS fees for the profile notifications:
// compensation-type fees (lost/damaged/billed materials) get their own card
// and modal, everything else belongs to the "Mangler betaling" card, whose
// modal only explains overdue-type fees ("fee"). Unrecognized types count
// toward the card total but are not attributed to either modal.
export type FeeSummary = {
  // Everything unpaid except compensation.
  unpaidTotal: number
  // Overdue-type fees only.
  lateFeeTotal: number
  lateMaterialCount: number
  // Compensation-type fees only.
  compensationTotal: number
  compensationMaterialCount: number
}

const sumAmount = (fees: Fee[]) => fees.reduce((sum, fee) => sum + fee.amount, 0)

// Material counts fall back to the fee count when the fees carry no
// materials (e.g. closed interlibrary loans), so copy never says "0 bøger".
const countMaterials = (fees: Fee[]) =>
  fees.reduce((sum, fee) => sum + fee.materialCount, 0) || fees.length

export const summarizeFees = (fees: Fee[]): FeeSummary => {
  const compensationFees = fees.filter(fee => fee.type === "compensation")
  const lateFees = fees.filter(fee => fee.type === "fee")

  return {
    unpaidTotal: sumAmount(fees) - sumAmount(compensationFees),
    lateFeeTotal: sumAmount(lateFees),
    lateMaterialCount: countMaterials(lateFees),
    compensationTotal: sumAmount(compensationFees),
    compensationMaterialCount: countMaterials(compensationFees),
  }
}
