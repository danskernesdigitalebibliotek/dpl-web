"use client"

import { useEffect, useState } from "react"

import withVisibility from "@/lib/helpers/visibility"

// This component is used to show a grid overlay on the screen when the user presses cmd + g
function GridHelper() {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    window.addEventListener("keydown", handleKeydown)
    return () => {
      window.removeEventListener("keydown", handleKeydown)
    }
  }, [])

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.metaKey && event.key === "k") {
      setIsShowing(currentValue => !currentValue)
    }
  }

  const columns = 12

  return (
    <>
      {isShowing ? (
        <div
          className="content-container pointer-events-none fixed inset-0 z-1000 mx-auto
            bg-transparent">
          <div className="grid-go h-full">
            {Array.from({ length: columns }).map((e, index) => (
              <div
                key={`gridHelper-column-${index}`}
                className="bg-content-purple-100/50 h-full w-full"
              />
            ))}
          </div>
        </div>
      ) : null}
    </>
  )
}

export default withVisibility(GridHelper)
