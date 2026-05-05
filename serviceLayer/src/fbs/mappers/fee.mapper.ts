import type { FeeMaterialV2 } from "../generated/model/feeMaterialV2"
import type { FeeV2 } from "../generated/model/feeV2"
import type { Fee, FeeMaterial } from "../types"

export function mapFeeMaterial(raw: FeeMaterialV2): FeeMaterial {
  return {
    materialItemNumber: raw.materialItemNumber,
    recordId: raw.recordId,
  }
}

export function mapFee(raw: FeeV2): Fee {
  return {
    amount: raw.amount,
    creationDate: raw.creationDate,
    feeId: raw.feeId,
    materials: raw.materials.map(mapFeeMaterial),
    payableByClient: raw.payableByClient,
    reasonMessage: raw.reasonMessage,
  }
}
