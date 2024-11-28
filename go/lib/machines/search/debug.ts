import { InspectionEvent } from "xstate"

export const debugEvents = (inspectionEvent: InspectionEvent) => {
  if (inspectionEvent.type === "@xstate.event") {
    // eslint-disable-next-line no-console
    console.debug(inspectionEvent.event)
  }
}
