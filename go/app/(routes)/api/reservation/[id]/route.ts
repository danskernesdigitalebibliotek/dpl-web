import { NextResponse } from "next/server"

import { deleteReservationServerSide } from "@/lib/helpers/reservation-server"

type Context = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  const reservationId = Number.parseInt(id, 10)
  if (!Number.isFinite(reservationId)) {
    return NextResponse.json({ error: "Invalid reservation id" }, { status: 400 })
  }

  try {
    const ok = await deleteReservationServerSide(reservationId)
    if (!ok) {
      return NextResponse.json({ error: "Du er ikke logget ind." }, { status: 401 })
    }
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reservationen kunne ikke slettes."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
