"use client"

import React, { useEffect } from "react"

import { appendAsset, removeAsset } from "@/lib/helpers/helper.scripts"

import { assets } from "./helper"

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      type: "preview"
      identifier: string
      orderId?: never
    }
  | {
      type: "loan"
      orderId: string
      identifier?: never
    }

const Player = ({ type, orderId, identifier }: ReaderType) => {
  useEffect(() => {
    assets.forEach(appendAsset)

    return () => {
      assets.forEach(removeAsset)
    }
  }, [])

  if (type === "loan") {
    return (
      <iframe
        title="Publizon Player"
        src={`https://play.pubhub.dk/index141.html?o=${orderId}`}
        style={{ height: "300px" }}
        className="player h-full w-full"
      />
    )
  }

  if (type === "preview") {
    return (
      <iframe
        title="Publizon Player"
        src={`https://play.pubhub.dk/index141.html?i=${identifier}`}
        style={{ height: "300px" }}
        className="player rounded-base h-full w-full"
      />
    )
  }
}

export default Player
