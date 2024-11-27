import { InspectionEvent } from "xstate"

export const debugEvents = (inspectionEvent: InspectionEvent) => {
  if (inspectionEvent.type === "@xstate.event") {
    console.debug(inspectionEvent.event)
  }
}
