import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

export const getAllWorkPids = (work: WorkTeaserSearchPageFragment) => {
  return work.manifestations.all.map(manifestation => manifestation.pid)
}
