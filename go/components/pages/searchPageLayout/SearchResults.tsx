"use client"

// import { useRouter } from "next/navigation"
import React from "react"

import WorkCard from "@/components/shared/workCard/WorkCard"
import { SearchWithPaginationQuery } from "@/lib/graphql/generated/fbi/graphql"

type SearchResultProps = {
  works: SearchWithPaginationQuery["search"]["works"]
}

const SearchResults = ({ works }: SearchResultProps) => {
  // const router = useRouter()

  return (
    <>
      <hr className="my-3 ml-[-12px] w-[100vw] border-black opacity-10 md:mx-auto md:mb-12 md:mt-6 md:w-full" />
      <div className="mb-10 grid grid-cols-2 gap-grid-gap-x md:mb-24 md:grid-cols-3">
        {works.map(work => (
          <WorkCard key={work.workId} work={work} />
        ))}
      </div>
    </>
  )
}

export default SearchResults
