import type { WorkPageQuery } from "./generated/graphql"

export type Work = NonNullable<WorkPageQuery["work"]>
export type Manifestation = Work["manifestations"]["all"][number]
