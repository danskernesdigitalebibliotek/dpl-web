"use client"

import { ErrorBoundary } from "react-error-boundary"

function ErrorFallback() {
  return (
    <div className="flex h-[200px] w-full flex-col items-center justify-center bg-background-overlay">
      <p>Noget gik galt ved visning af denne blok - måske den mangler indhold?</p>
    </div>
  )
}

function ParagraphErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
}

export { ParagraphErrorBoundary }
