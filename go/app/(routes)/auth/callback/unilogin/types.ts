import * as z from "zod"

import schemas from "./schemas"

export type TInstitution = z.infer<typeof schemas.institution>
