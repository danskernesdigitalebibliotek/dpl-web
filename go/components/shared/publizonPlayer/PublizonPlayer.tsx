"use client"

import React, { useEffect } from "react"

import { appendAsset, removeAsset } from "@/lib/helpers/helper.scripts"

import { assets } from "./helper"

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      type: "demo"
      identifier: string
      orderId?: never
    }
  | {
      type: "rent"
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

  if (type === "rent") {
    return (
      <iframe
        title="Publizon Player"
        src={`https://play.pubhub.dk/index141.html?o=${orderId}`}
        style={{ height: "300px" }}
        className="player h-full w-full"
      />
    )
  }

  if (type === "demo") {
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
