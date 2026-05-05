import { Factory } from "fishery";
import { Availability } from "@dpl/service-layer/fbs";

/**
 * Factory for FBS Availability
 * Default represents a material that is available and reservable with no queue
 */
export const availabilityFactory = Factory.define<Availability>(() => ({
  recordId: "870970-basis:52557240",
  available: true,
  reservable: true,
  reservations: 0
}));
