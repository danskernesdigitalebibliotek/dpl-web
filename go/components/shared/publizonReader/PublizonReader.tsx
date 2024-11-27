"use client"

import React, { useEffect } from "react"

import { appendAsset, readerAssets, removeAsset } from "./helper"

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      type: "demo"
      identifier: string
      orderId?: never
      onBackCallback: () => void
    }
  | {
      type: "rent"
      identifier?: never
      orderId: string
      onBackCallback: () => void
    }

const Reader = ({ type, onBackCallback, identifier, orderId }: ReaderType) => {
  useEffect(() => {
    readerAssets.forEach(appendAsset)

    // Attach the onReaderBackCallback function to the window object to be able to enable callback methods calls through the close button
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-shadow
    window.onReaderBackCallback = () => {
      onBackCallback()
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.onReaderBackCallback
      readerAssets.forEach(removeAsset)
    }
  }, [])

  if (type === "rent") {
    return (
      <div>
        <p>orderId: {orderId}</p>
        <div
          id="pubhub-reader"
          // eslint-disable-next-line react/no-unknown-property
          order-id={orderId}
          role="button"
          tabIndex={0}
          close-href="javascript:window.onReaderBackCallback()"
          aria-label="Go back"
        />
      </div>
    )
  }

  if (type === "demo") {
    return (
      <div
        id="pubhub-reader"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line react/no-unknown-property
        identifier={identifier}
        close-href="javascript:window.onReaderBackCallback()"
        role="button"
        tabIndex={0}
        aria-label="Go back"
      />
    )
  }

  return null
}

export default Reader
