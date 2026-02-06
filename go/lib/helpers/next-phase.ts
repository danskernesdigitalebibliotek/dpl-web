import { PHASE_PRODUCTION_BUILD } from "next/constants"

import { getServerEnv } from "../config/env"

export const isBuildingGoApp = () => getServerEnv("NEXT_PHASE") === PHASE_PRODUCTION_BUILD
