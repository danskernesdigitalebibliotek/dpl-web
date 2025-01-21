import {
  ManifestationDetailsFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"

export const displayCreators = (
  creators: WorkFullWorkPageFragment["creators"] | ManifestationDetailsFragment["contributors"],
  amount: number
) => {
  return creators.reduce((acc, creator, index) => {
    // We shorten to max <amount> creators
    if (index === amount) {
      return acc + ", et. al"
    }
    // We don't want to show one person twice
    if (index > amount || acc.includes(creator.display)) {
      return acc
    }
    return acc + (index > 0 ? ", " : "") + creator.display
  }, "")
}

export const getAllCreators = (
  creators: WorkFullWorkPageFragment["creators"] | ManifestationDetailsFragment["contributors"]
) => {
  return creators.reduce((acc, creator) => {
    // Don't show one person twice
    if (acc.includes(creator.display)) {
      return acc
    }
    return [...acc, creator.display]
  }, [] as string[])
}
