import { Link } from "react-router"

import { ArticleSearch } from "./ArticleSearch"

/** A slim take on the library sites' header: a name and the search, here among articles only. */
export const SiteHeader = () => (
  <header className="relative z-40 border-b border-outline bg-white font-body text-text-heading">
    <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-8 md:px-20 md:py-4">
      <Link to="/" className="shrink-0 text-[20px] leading-7 text-text-heading no-underline">
        <span className="font-semibold">Artikler</span>
        <span className="ml-2 text-body-s text-text-inactive">prototype</span>
      </Link>
      <div className="w-full md:max-w-[760px]">
        <ArticleSearch />
      </div>
    </div>
  </header>
)
