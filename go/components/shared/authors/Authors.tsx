import React from "react"

import {
  ManifestationDetailsFragment,
  WorkFullWorkPageFragment,
} from "@/lib/graphql/generated/fbi/graphql"
import { getAllCreators } from "@/lib/helpers/helper.creators"
import { resolveUrl } from "@/lib/helpers/helper.routes"

type AuthorsProps = {
  creators: WorkFullWorkPageFragment["creators"] | ManifestationDetailsFragment["contributors"]
}

const Authors = ({ creators }: AuthorsProps) => {
  const workCreators = getAllCreators(creators)

  return (
    <>
      {!!workCreators.length && (
        <h2 className="mt-grid-gap-2 text-typo-subtitle-sm uppercase lg:mt-7">
          {"af "}
          {workCreators.map((creator, index) => {
            return (
              <span key={creator}>
                <span
                  onClick={() =>
                    resolveUrl({ routeParams: { search: "search" }, queryParams: { q: creator } })
                  }
                  className="animate-text-underline">
                  {creator}
                </span>
                {index + 1 < creators.length && ", "}
              </span>
            )
          })}
        </h2>
      )}
    </>
  )
}

export default Authors
