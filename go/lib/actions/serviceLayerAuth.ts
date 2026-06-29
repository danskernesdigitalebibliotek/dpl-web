"use server"

import { cookies } from "next/headers"

import { TServiceType } from "@/lib/helpers/ap-service"
import { getBearerTokenServerSide } from "@/lib/helpers/bearer-token"

export async function getServiceLayerAuthHeader(api: TServiceType): Promise<string> {
  const token = await getBearerTokenServerSide(api, await cookies())
  return token ? `Bearer ${token}` : ""
}
