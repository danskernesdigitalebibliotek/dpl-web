"use client"

import localFont from "next/font/local"

const GTFlexa = localFont({
  src: [
    {
      path: "../../fonts/GT-Flexa-Expanded-Regular.woff2",
      weight: "400",
    },
    {
      path: "../../fonts/GT-Flexa-Expanded-Medium.woff2",
      weight: "500",
    },
  ],
  variable: "--font-headline",
  display: "swap",
})

export default function FontsProvider() {
  return (
    <style jsx global>
      {`
        :root {
          --font-headline: ${GTFlexa.style.fontFamily}, sans-serif;
        }
      `}
    </style>
  )
}
