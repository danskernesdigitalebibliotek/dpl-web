"use client"

import React, { useEffect } from "react"

// TODO: Replace the reference id with the with a parameter from the CMS
function VideoPlayer() {
  const [mounted, setMounted] = React.useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="w-full">
      {mounted && (
        <div className="relative aspect-16/9 w-full">
          <iframe
            aria-label="Naja Marie Aidt - Oevelser i moerke"
            className="absolute inset-0 h-full w-full"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%!important",
              height: "100%!important",
            }}
            src="https://media.videotool.dk/?vn=557_2024111913325696587632242634"
            allowFullScreen
            allow="autoplay; fullscreen"></iframe>
        </div>
      )}
    </div>
  )
}

export default VideoPlayer
