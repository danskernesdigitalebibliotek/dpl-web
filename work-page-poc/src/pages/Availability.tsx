import { useMaterialAvailability } from "@danskernesdigitalebibliotek/dpl-service-layer"

import { pidToFaust } from "../fbi/pidToFaust"

type AvailabilityProps = {
  workId: string
  pids: string[]
  shownPid: string
}

/** Physical availability from FBS, through the service layer. */
export const Availability = ({ workId, pids, shownPid }: AvailabilityProps) => {
  const { data, isPending, error } = useMaterialAvailability(workId, pids.map(pidToFaust))

  if (error) return <p>Availability unavailable: {error.message}</p>
  if (isPending) return <p>Checking availability…</p>

  const shownRecord = data.records[pidToFaust(shownPid)]

  return (
    <p>
      This edition:{" "}
      {shownRecord ? `${shownRecord.availableCopies} of ${shownRecord.totalCopies} copies home` : "not held by the library"}
      <br />
      Whole work: {data.totalCopies} copies, {data.reservationCount} reservations
    </p>
  )
}
