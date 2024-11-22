"use client"

import React, { useEffect } from "react"

import { appendAsset, readerAssets, removeAsset } from "./helper"

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      type: "demo"
      identifier: string
      onBackCallback: () => void
    }
  | {
      type: "rent"
      orderId: string
      onBackCallback: () => void
    }

const Reader = (props: ReaderType) => {
  useEffect(() => {
    readerAssets.forEach(appendAsset)

    // Attach the onReaderBackCallback function to the window object to be able to enable callback methods calls through the close button
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-shadow
    window.onReaderBackCallback = () => {
      props.onBackCallback()
    }

    return () => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      delete window.onReaderBackCallback
      readerAssets.forEach(removeAsset)
    }
  }, [props])

  if (props.type === "rent") {
    return (
      <div>
        <p>orderId: {props.orderId}</p>
        <div
          id="pubhub-reader"
          // eslint-disable-next-line react/no-unknown-property
          order-id={props.orderId}
          role="button"
          tabIndex={0}
          close-href="javascript:window.onReaderBackCallback()"
          aria-label="Go back"
        />
      </div>
    )
  }

  if (props.type === "demo") {
    return (
      <div
        id="pubhub-reader"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line react/no-unknown-property
        identifier={props.identifier}
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
