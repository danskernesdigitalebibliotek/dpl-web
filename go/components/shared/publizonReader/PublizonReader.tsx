"use client"

import React, { useEffect } from "react"

import { appendAsset, removeAsset } from "@/lib/helpers/helper.scripts"

import { readerAssets } from "./helper"

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      type: "preview"
      identifier: string
      orderId?: never
      onBackCallback: () => void
    }
  | {
      type: "loan"
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

  if (type === "loan") {
    return (
      <div
        style={{ height: "100vh" }}
        id="pubhub-reader"
        order-id={orderId}
        role="button"
        tabIndex={0}
        // This is a workaround to make the close button work in the reader
        // eslint-disable-next-line no-script-url
        close-href="javascript:window.onReaderBackCallback()"
        aria-label="Go back"
      />
    )
  }

  if (type === "preview") {
    return (
      <div
        style={{ height: "100vh" }}
        id="pubhub-reader"
        // identifier is a reserved attribute and causes a warning in the ts therefore we ignore it
        // @ts-ignore
        identifier={identifier}
        // This is a workaround to make the close button work in the reader
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
