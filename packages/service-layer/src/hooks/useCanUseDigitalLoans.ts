"use client"

import { useServiceLayerConfig } from "../context/ServiceLayerContext"
import { canUseDigitalLoans } from "./internal"

/**
 * Whether the session may call patron-scoped digital endpoints, by the same
 * rule the digital query hooks gate on. For consumers that need to know
 * whether those hooks will ask at all.
 */
export const useCanUseDigitalLoans = (): boolean => canUseDigitalLoans(useServiceLayerConfig())
