import { type FormEvent } from "react"
import { Link, useSearchParams } from "react-router"

import { useSearchWorks } from "../fbi/useSearchWorks"

/** A plain FBI search, only there to find works to open. */
export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") ?? ""
  const { data, isFetching, error } = useSearchWorks(searchQuery)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get("q")).trim()
    setSearchParams(query ? { q: query } : {})
  }

  return (
    <main>
      <h1>Find a work</h1>
      <form onSubmit={handleSubmit} role="search">
        <input name="q" type="search" defaultValue={searchQuery} size={40} />{" "}
        <button type="submit">Search</button>
      </form>

      {isFetching && <p>Searching…</p>}
      {error && <p>Search failed: {error.message}</p>}
      {data && (
        <>
          <p>{data.search.hitcount} hits</p>
          <ol>
            {data.search.works.map((work) => (
              <li key={work.workId}>
                <Link to={`/work/${encodeURIComponent(work.workId)}`}>{work.titles.full.join(" ")}</Link>
                {" – "}
                {work.creators.map((creator) => creator.display).join(", ")}
                {" ("}
                {work.materialTypes.map((materialType) => materialType.materialTypeSpecific.display).join(", ")}
                {")"}
              </li>
            ))}
          </ol>
        </>
      )}
    </main>
  )
}
