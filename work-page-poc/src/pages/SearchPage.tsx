import { Link, useSearchParams } from "react-router"

import { getArticleSearchCql, useSearchArticles } from "../fbi/useSearchArticles"

/** The results of the header's search: articles only, to find one to open. */
export const SearchPage = () => {
  const [searchParams] = useSearchParams()
  const searchQuery = searchParams.get("q") ?? ""
  const { data, isFetching, error } = useSearchArticles(searchQuery)

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-8 font-body text-text-heading md:px-20">
      {!searchQuery && <p className="m-0 text-body-m">Søg efter en artikel i feltet øverst.</p>}
      {searchQuery && (
        <h1 className="m-0 font-heading text-[28px] leading-[34px] font-normal">
          Artikler for “{searchQuery}”{data && ` (${data.complexSearch.hitcount})`}
        </h1>
      )}
      {searchQuery && (
        <p className="m-0 mt-1 text-caption text-text-inactive">CQL: {getArticleSearchCql(searchQuery)}</p>
      )}
      {isFetching && <p className="text-body-m">Søger…</p>}
      {error && <p className="text-body-m">Søgningen fejlede: {error.message}</p>}
      {data?.complexSearch.errorMessage && <p className="text-body-m">FBI: {data.complexSearch.errorMessage}</p>}
      {data && (
        <ol className="m-0 mt-6 flex list-none flex-col gap-2 p-0">
          {data.complexSearch.works.map((work) => {
            const host = work.manifestations.bestRepresentation.hostPublication?.summary
            return (
              <li key={work.workId} className="border border-solid border-outline bg-white px-4 py-3.5">
                <Link
                  to={`/work/${encodeURIComponent(work.workId)}`}
                  className="font-heading text-[18px] leading-6 text-text-heading underline-offset-4"
                >
                  {work.titles.full.join(" ")}
                </Link>
                <p className="m-0 mt-0.5 text-body-s leading-5 text-text-body">
                  {[
                    work.creators.map((creator) => creator.display).join(", "),
                    work.materialTypes.map((materialType) => materialType.materialTypeSpecific.display).join(", "),
                    host,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            )
          })}
        </ol>
      )}
    </main>
  )
}
