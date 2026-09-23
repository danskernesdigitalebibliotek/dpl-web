"use client"

import { usePatron } from "@danskernesdigitalebibliotek/dpl-service-layer"
import { useContext } from "react"

import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

// To become true the library must have SMS notifications enabled, the patron
// must have a number registred and consented to SMS notifications.
export const useShowSmsNotice = (): boolean => {
  const dplCmsConfig = useContext(DplCmsConfigContext)
  const { data: patron } = usePatron()
  return (
    (dplCmsConfig?.smsNotificationsEnabled ?? true) && !!patron?.phoneNumber && !!patron?.receiveSms
  )
}
