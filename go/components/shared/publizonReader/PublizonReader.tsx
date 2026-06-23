"use client"

import React, { useEffect, useRef } from "react"

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
  // Latest callback via ref so the asset effect runs once — a changing
  // onBackCallback would re-append the scripts and break the load.
  const onBackRef = useRef(onBackCallback)
  onBackRef.current = onBackCallback

  useEffect(() => {
    readerAssets.forEach(appendAsset)

    // Attach the onReaderBackCallback function to the window object to be able to enable callback methods calls through the close button
    // @ts-ignore
    window.onReaderBackCallback = () => {
      onBackRef.current()
    }

    return () => {
      // @ts-ignore
      delete window.onReaderBackCallback
      readerAssets.forEach(removeAsset)
    }
  }, [])

  if (type === "loan") {
    return (
      <div
        style={{ height: "100%" }}
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
        style={{ height: "100%" }}
        id="pubhub-reader"
        // identifier is a reserved attribute — TS warns, so ignore
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
