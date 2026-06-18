import { createReservation } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { z } from "zod"

import { getBearerTokenServerSide } from "@/lib/helpers/bearer-token"
import { getServiceLayerConfig } from "@/lib/helpers/service-layer"

const InputSchema = z.object({
  recordId: z.string().min(1),
  pickupBranchId: z.string().optional(),
  expiryDate: z.string().optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = InputSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reservation input" }, { status: 400 })
  }

  const token = await getBearerTokenServerSide("fbs", await cookies())
  if (!token) {
    return NextResponse.json({ error: "Du er ikke logget ind." }, { status: 401 })
  }

  try {
    const result = await createReservation(getServiceLayerConfig(token), parsed.data)
    return NextResponse.json({ result }, { status: 200 })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Reservationen kunne ikke gennemføres."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
