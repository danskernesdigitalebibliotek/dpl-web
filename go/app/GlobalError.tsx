"use client"

import React, { Component, ReactNode } from "react"

import ErrorPageLayout from "@/components/pages/errorPageLayout/ErrorPageLayout"

interface GlobalErrorState {
  hasError: boolean
}

interface GlobalErrorProps {
  children?: ReactNode
}

// This error boundary component is used to catch errors in the application globally and add it to existing layout.
// It is inspired by following posts:
// - https://nextjs.org/docs/app/api-reference/file-conventions/error#graceful-error-recovery-with-a-custom-error-boundary
// - https://medium.com/@kaiqueperezz/handling-errors-in-the-frontend-with-next-js-improving-ux-and-avoiding-surprises-3970d3f88821

class GlobalError extends Component<GlobalErrorProps, GlobalErrorState> {
  contentRef: React.RefObject<HTMLDivElement>

  constructor(props: Record<string, unknown>) {
    super(props)
    this.state = { hasError: false }
    this.contentRef = React.createRef<HTMLDivElement>() as React.RefObject<HTMLDivElement>
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }
  render() {
    if (this.state.hasError) {
      return (
        <>
          <ErrorPageLayout
            title="Ups! Noget gik galt."
            description={<p>Der skete en systemfejl.</p>}
          />
          {/* eslint-disable react/no-danger */}
          <div
            ref={this.contentRef}
            suppressHydrationWarning
            dangerouslySetInnerHTML={{
              __html: this.contentRef.current?.innerHTML || "",
            }}
          />
          {/* eslint-enable react/no-danger */}
        </>
      )
    }
    return <div ref={this.contentRef}>{this.props.children}</div>
  }
}
export default GlobalError
