import React, { CSSProperties, useEffect } from "react"

import { appendAsset, readerAssets } from "./helper"

// type ReaderType = { identifier?: string; orderId?: string };

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      identifier: string
      orderId?: never
    }
  | {
      identifier?: never
      orderId: string
    }

const Reader = ({ identifier, orderId }: ReaderType) => {
  useEffect(() => {
    readerAssets.forEach(appendAsset)
  }, [identifier, orderId])

  const readerStyles: CSSProperties = {
    position: "absolute",
    top: "0", // Padding from the top
    left: "0", // Padding from the left
    right: "0", // Padding from the right
    bottom: "0", // Padding from the bottom
    padding: "20px", // Padding for the reader
    width: "100%",
    maxWidth: "unset",
    zIndex: 1000,
    // border: "1px dotted black", // Should be removed in production
    margin: "0",
  }

  const handleBack = () => {
    window.history.back()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      handleBack()
    }
  }

  if (orderId) {
    return (
      <div>
        <p>orderId: {orderId}</p>
        <div
          style={readerStyles}
          id="pubhub-reader"
          // eslint-disable-next-line react/no-unknown-property
          order-id={orderId}
          role="button"
          tabIndex={0}
          onClick={handleBack}
          onKeyDown={handleKeyDown}
          aria-label="Go back"
        />
      </div>
    )
  }

  if (identifier) {
    return (
      <div
        style={readerStyles}
        id="pubhub-reader"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line react/no-unknown-property
        identifier={identifier}
        role="button"
        tabIndex={0}
        onClick={handleBack}
        onKeyDown={handleKeyDown}
        aria-label="Go back"
      />
    )
  }

  return null
}

export default Reader
