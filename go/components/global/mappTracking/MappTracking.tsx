"use client"

import { usePathname } from "next/navigation"
import { useContext, useEffect, useRef } from "react"

import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"

declare global {
  interface Window {
    _tiConfig?: {
      tiDomain: string
      tiId: string
      option: Record<string, string>
    }
    _ti?: Record<string, string>
    wts?: Array<unknown[]>
    wt_r?: number
    wt_mcp_hide?: { show: () => void }
  }
}

export default function MappTracking() {
  const config = useContext(DplCmsConfigContext)
  const pathname = usePathname()
  const isInitialLoad = useRef(true)

  const domain = config?.mapp?.domain
  const id = config?.mapp?.id

  // Initial script injection — replicates tiLoader.min.js from CMS.
  useEffect(() => {
    if (!domain || !id) return

    // Mapp SDK globals use underscore-prefixed names by convention.
    // eslint-disable-next-line no-underscore-dangle
    window._tiConfig = window._tiConfig || {
      tiDomain: domain,
      tiId: id,
      option: {},
    }

    window.wts = window.wts || []

    // Don't load the script twice.
    if (document.getElementById("mapp-ti-loader")) return

    // Respect the rate-limit cookie set by the Mapp script.
    if (document.cookie.indexOf("wt_r=1") !== -1) return

    const scriptUrl =
      domain +
      "/resp/api/get/" +
      id +
      "?url=" +
      encodeURIComponent("https://" + window.location.host + "/") +
      "&v=5"

    const firstScript = document.getElementsByTagName("script")[0]
    const script = document.createElement("script")
    script.id = "mapp-ti-loader"
    script.async = true
    script.src = "//" + scriptUrl

    script.onload = () => {
      if (typeof window.wt_r !== "undefined" && !isNaN(window.wt_r)) {
        const date = new Date()
        date.setTime(date.getTime() + 1000 * window.wt_r)
        document.cookie = "wt_r=1;path=/;expires=" + date.toUTCString()
      }
    }

    script.onerror = () => {
      if (typeof window.wt_mcp_hide !== "undefined" && typeof window.wt_mcp_hide.show === "function") {
        window.wt_mcp_hide.show()
        window.wt_mcp_hide.show = () => {}
      }
    }

    firstScript?.parentNode?.insertBefore(script, firstScript)
  }, [domain, id])

  // Track SPA navigations — skip the initial page load (handled by Mapp automatically).
  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    if (window.wts) {
      window.wts.push(["send", "pageupdate"])
    }
  }, [pathname])

  return null
}
