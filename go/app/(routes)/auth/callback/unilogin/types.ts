import * as z from "zod"

import schemas from "./schemas"

export type TInstitution = z.infer<typeof schemas.institution>

export type TIntrospectionResponse = z.infer<typeof schemas.introspect>
