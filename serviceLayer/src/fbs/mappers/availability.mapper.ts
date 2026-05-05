import type { AvailabilityV3 } from "../generated/model/availabilityV3"
import type { Availability } from "../types"

export function mapAvailability(raw: AvailabilityV3): Availability {
  return {
    available: raw.available,
    recordId: raw.recordId,
    reservable: raw.reservable,
    reservations: raw.reservations,
  }
}
