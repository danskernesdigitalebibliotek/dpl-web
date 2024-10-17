"use client"

import { Suspense } from "react"

import { useSearchWithPaginationQuery } from "@/lib/generated/graphql/fbi/graphql"

const Page = ({ params: { q } }: { params: { q: string } }) => {
  const { data } = useSearchWithPaginationQuery({
    q: { all: q },
    offset: 0,
    limit: 10,
  })
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </Suspense>
  )
}

export default Page
