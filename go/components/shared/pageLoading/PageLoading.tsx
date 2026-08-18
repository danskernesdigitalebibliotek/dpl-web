// Generic loading state for pages without a dedicated skeleton.
// Besides communicating that the page is loading, rendering actual markup is
// what lets the App Router reset the scroll position on soft navigation: the
// router bails out of scrolling when a segment commits without any DOM.
const PageLoading = () => {
  return (
    <div role="status">
      <span className="sr-only">Siden indlæses</span>
    </div>
  );
};
export default PageLoading;
