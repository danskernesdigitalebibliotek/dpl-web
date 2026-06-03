export type Patron = {
  name: string | undefined
  isLocked: boolean
}

export type Availability = {
  faustId: string
  isAvailable: boolean
  isReservable: boolean
  reservationCount: number
}
