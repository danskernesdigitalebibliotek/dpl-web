import { InspectionEvent } from "xstate"

export const debugEvents = (inspectionEvent: InspectionEvent) => {
  if (inspectionEvent.type === "@xstate.event") {
    // eslint-disable-next-line no-console
    console.debug({
      currentState: inspectionEvent.actorRef.getSnapshot().value,
      context: inspectionEvent.actorRef.getSnapshot().context,
      event: inspectionEvent.event,
    })
  }
}
