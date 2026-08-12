// Mirrors the full screen surface of ReadPageLayout.
const ReadPageLoading = () => {
  return (
    <div className="bg-reader-grey absolute inset-0 h-screen w-screen" role="status">
      <span className="sr-only">Læseren indlæses</span>
    </div>
  )
}

export default ReadPageLoading
