export const patronQueryKey = () => ["serviceLayer", "patron"] as const

export const materialAvailabilityQueryKey = (workId: string) =>
  ["serviceLayer", "materialAvailability", workId] as const

export const reservationsQueryKey = () => ["serviceLayer", "reservations"] as const
