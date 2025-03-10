"use client"

import React, { useEffect } from "react"

import { appendAsset, removeAsset } from "@/lib/helpers/helper.scripts"

import { readerAssets } from "./helper"

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
    // @ts-ignore
    window.onReaderBackCallback = () => {
      onBackCallback()
    }

    return () => {
      // @ts-ignore
      delete window.onReaderBackCallback
      readerAssets.forEach(removeAsset)
    }
  }, [onBackCallback])

  if (type === "rent") {
    return (
      <div>
        <p>orderId: {orderId}</p>
        <div
          id="pubhub-reader"
          order-id={orderId}
          role="button"
          tabIndex={0}
          // eslint-disable-next-line no-script-url
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
        // @ts-ignore
        identifier={identifier}
        // eslint-disable-next-line no-script-url
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
