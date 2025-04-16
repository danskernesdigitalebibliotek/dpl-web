import { z } from "zod"

import { getLibraryProfileSchema } from "./schemas"

export type TGetLibraryProfile = z.infer<typeof getLibraryProfileSchema>
