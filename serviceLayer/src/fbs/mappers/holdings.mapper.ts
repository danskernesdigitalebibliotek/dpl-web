import type { HoldingsForBibliographicalRecordLogisticsV1 } from "../generated/model/holdingsForBibliographicalRecordLogisticsV1"
import type { HoldingsLogisticsV1 } from "../generated/model/holdingsLogisticsV1"
import type { MaterialV3 } from "../generated/model/materialV3"
import type { PlacementV1 } from "../generated/model/placementV1"
import type {
  HoldingsForBibliographicalRecord,
  HoldingsLogistics,
  HoldingsMaterial,
  Placement,
} from "../types"
import { mapBranch } from "./branch.mapper"

export function mapPlacement(raw: PlacementV1): Placement {
  return {
    department: raw.department,
    location: raw.location,
    sublocation: raw.sublocation,
  }
}

export function mapHoldingsMaterial(raw: MaterialV3): HoldingsMaterial {
  return {
    available: raw.available,
    itemNumber: raw.itemNumber,
    materialGroup: raw.materialGroup,
    periodical: raw.periodical,
  }
}

export function mapHoldingsLogistics(
  raw: HoldingsLogisticsV1
): HoldingsLogistics {
  return {
    branch: mapBranch(raw.branch),
    lmsPlacement: raw.lmsPlacement ? mapPlacement(raw.lmsPlacement) : undefined,
    logisticsPlacement: raw.logisticsPlacement,
    materials: raw.materials.map(mapHoldingsMaterial),
  }
}

export function mapHoldingsForBibliographicalRecord(
  raw: HoldingsForBibliographicalRecordLogisticsV1
): HoldingsForBibliographicalRecord {
  return {
    holdings: raw.holdings.map(mapHoldingsLogistics),
    recordId: raw.recordId,
    reservable: raw.reservable,
    reservations: raw.reservations,
  }
}
