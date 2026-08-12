// Shared fallback for the page-level <Suspense> wrappers — do not remove it
// from a page. Besides communicating that the page is loading, rendering
// actual markup is what lets the App Router reset the scroll position on soft
// navigation: the router bails out of scrolling when a segment commits
// without any DOM.
const PageLoading = () => {
  return (
    <div className="content-container my-grid-gap-2 space-y-grid-gap-2" role="status">
      <span className="sr-only">Siden indlæses</span>
      <div className="bg-background-skeleton h-[46px] w-[60%] animate-pulse rounded-md" />
      <div className="bg-background-skeleton h-[300px] w-full animate-pulse rounded-md" />
      <div className="bg-background-skeleton h-[13px] w-[80%] animate-pulse rounded-md" />
      <div className="bg-background-skeleton h-[13px] w-[70%] animate-pulse rounded-md" />
    </div>
  )
}

export default PageLoading
