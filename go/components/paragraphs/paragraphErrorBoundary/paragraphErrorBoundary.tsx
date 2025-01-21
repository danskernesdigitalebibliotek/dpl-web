"use client"

import { ErrorBoundary } from "react-error-boundary"

import { Button } from "../../shared/button/Button"

function ErrorFallback({ resetErrorBoundary }: { resetErrorBoundary: () => void }) {
  return (
    <div className="flex h-[200px] w-full flex-col items-center justify-center">
      <p>Noget gik galt ved visning af denne blok - måske den mangler indhold?</p>
      <Button className="mt-4" onClick={resetErrorBoundary}>
        Genindlæs
      </Button>
    </div>
  )
}

function ParagraphErrorBoundary({ children }: { children: React.ReactNode }) {
  return <ErrorBoundary FallbackComponent={ErrorFallback}>{children}</ErrorBoundary>
}

export { ParagraphErrorBoundary }
