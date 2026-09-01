import type {
  GetMaterialQuery,
  ManifestationWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"

type Work = NonNullable<GetMaterialQuery["work"]>

// Find the manifestation matching a pid within a work. Encapsulates the
// `work.manifestations.all` shape so callers don't traverse it themselves —
// a schema change to the manifestations container is a single-file edit.
export const findManifestationByPid = (
  work: Work | null | undefined,
  pid: string
): ManifestationWorkPageFragment | undefined => {
  return work?.manifestations?.all?.find(m => m.pid === pid)
}
