import { deleteReservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { getBearerTokenServerSide } from "@/lib/helpers/bearer-token"
import { getServiceLayerConfig } from "@/lib/helpers/service-layer"

type Context = { params: Promise<{ id: string }> }

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params
  const reservationId = Number.parseInt(id, 10)
  if (!Number.isFinite(reservationId)) {
    return NextResponse.json({ error: "Invalid reservation id" }, { status: 400 })
  }

  const token = await getBearerTokenServerSide("fbs", await cookies())
  if (!token) {
    return NextResponse.json({ error: "Du er ikke logget ind." }, { status: 401 })
  }

  try {
    await deleteReservation(getServiceLayerConfig(token), reservationId)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reservationen kunne ikke slettes."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
