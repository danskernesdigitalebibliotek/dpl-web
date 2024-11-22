"use client"

import React, { useEffect } from "react"

import { appendAsset, readerAssets, removeAsset } from "./helper"

// Define mutually exclusive types for identifier and orderId
type ReaderType =
  | {
      type: "demo"
      identifier: string
    }
  | {
      type: "rent"
      orderId: string
    }

const Player = (props: ReaderType) => {
  const loadScript = () => {
    const script = document.createElement("script")

    script.src = "https://play.pubhub.dk/1.3.0/js/player-kernel.min.js"
    document.head.appendChild(script)

    // const script2 = document.createElement("script");
    // script2.src = "https://reader.pubhub.dk/2.2.0/js/app.js";
    // script2.defer = true;
    // script2.async = false;
    // script2.type = "module";
    // document.head.appendChild(script2);

    // const link = document.createElement("link");
    // link.href = "https://reader.pubhub.dk/2.2.0/css/chunk-vendors.css";
    // link.rel = "stylesheet";
    // document.head.appendChild(link);

    // const link2 = document.createElement("link");
    // link2.href = "https://reader.pubhub.dk/2.2.0/css/app.css";
    // link2.rel = "stylesheet";
    // document.head.appendChild(link2);
  }

  // useEffect(() => {
  //   readerAssets.forEach(appendAsset)

  //   return () => {
  //     readerAssets.forEach(removeAsset)
  //   }
  // }, [props])

  useEffect(() => {
    loadScript()
  }, [])

  if (props.type === "rent") {
    return (
      <iframe
        style={{ height: "300px" }}
        src={`https://play.pubhub.dk/index141.html?o=${props.orderId}`}
        className="player h-full w-full"
      />
    )
  }

  if (props.type === "demo") {
    console.log(props.identifier)

    return (
      <iframe
        style={{ height: "300px" }}
        src={`https://play.pubhub.dk/index141.html?i=${props.identifier}`}
        className="player h-full max-h-[300px] w-full rounded-base"
      />
    )
  }
}

export default Player
