'use client'

import { useSearchParams } from 'next/navigation'

import { useSearchWithPaginationQuery } from '@/lib/graphql/generated/fbi/graphql'

const SearchPageLayout = ({ searchQuery }: { searchQuery?: string }) => {
  const searchParams = useSearchParams()
  const q = searchQuery || searchParams.get('q') || ''

  const { data, error, isLoading, isPending, isFetching } =
    useSearchWithPaginationQuery({
      q: { all: q },
      offset: 0,
      limit: 10,
      filters: {}
    })

  if (error) {
    return <div>Error: {<pre>{JSON.stringify(error, null, 2)}</pre>}</div>
  }

  if (!data) return null
  const {
    search: { hitcount, works }
  } = data

  return (
    <div className="content-container">
      <h1 className="text-typo-heading-2">{`Viser resultater for "${q}" (${hitcount})`}</h1>
      {isFetching && <p>isFetching...</p>}
      {isLoading && <p>isLoading...</p>}
      {isPending && <p>isPending...</p>}
      {hitcount === 0 && <p>Ingen resultater</p>}
      <div className="gap-grid-gap-x grid grid-cols-3">
        {hitcount > 0 &&
          works.map((work) => (
            <div key={work.workId} className="bg-background-foreground p-4">
              <p>{work.titles.full}</p>

              <pre>{JSON.stringify(work, null, 2)}</pre>
            </div>
          ))}
      </div>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default SearchPageLayout
