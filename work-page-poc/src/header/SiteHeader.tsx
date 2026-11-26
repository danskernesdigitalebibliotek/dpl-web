import { Link } from "react-router"

import { ArticleSearch } from "./ArticleSearch"

/**
 * The library sites' header, as on bibliotek.kk.dk: a logo cell, a top row
 * and a full-width search row, in bordered cells. Here the search is among
 * articles only, and the top row says what the page is.
 */
export const SiteHeader = () => (
  <header className="relative z-40 flex flex-col border-b border-outline bg-surface-page font-body text-text-heading md:flex-row">
    <Link
      to="/"
      className="box-border flex h-16 shrink-0 flex-col justify-center border-b border-outline px-4 text-text-heading no-underline md:h-auto md:w-[250px] md:border-r md:border-b-0 md:border-solid md:px-10"
    >
      <span className="text-[16px] leading-5 font-bold tracking-[0.02em] uppercase md:text-[21px] md:leading-[26px]">
        Artikler
      </span>
      <span className="text-[12px] leading-4 font-bold tracking-[0.02em] text-text-body uppercase md:text-[14px] md:leading-5">
        Prototype
      </span>
    </Link>
    <div className="flex min-w-0 grow flex-col">
      <div className="hidden h-[72px] items-center border-b border-outline px-6 text-[18px] md:flex">
        Materialesiden for artikler
      </div>
      <div className="h-14 md:h-[72px]">
        <ArticleSearch />
      </div>
    </div>
  </header>
)
