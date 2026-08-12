import React from "react"

import { SearchResultsSkeleton } from "@/components/pages/searchPageLayout/SearchResults"
import { SearchFiltersDesktopSkeleton } from "@/components/shared/searchFilters/SearchFiltersDesktop"

// Mirrors the loading state SearchPageLayout renders while results are fetched.
const SearchPageLoading = () => {
  return (
    <div className="content-container space-y-grid-gap-2" role="status" aria-live="polite">
      <span className="sr-only">Søgeresultater indlæses</span>
      <div className="hidden lg:block">
        <SearchFiltersDesktopSkeleton />
      </div>
      <hr />
      <div className="mb-space-y flex flex-col gap-y-[calc(var(--grid-gap-x)*2)]">
        <SearchResultsSkeleton />
      </div>
    </div>
  )
}

export default SearchPageLoading
