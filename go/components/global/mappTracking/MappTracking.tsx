"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useContext, useEffect, useRef } from "react"

import goConfig from "@/lib/config/goConfig"
import { DplCmsConfigContext } from "@/lib/providers/DplCmsConfigContextProvider"
import { clearPageStatistics, collectPageStatistics, sendPageUpdate } from "@/lib/tracking/mapp"
import { statistics } from "@/lib/tracking/statistics"

export default function MappTracking() {
  const config = useContext(DplCmsConfigContext)
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isInitialLoad = useRef(true)

  const searchQuery = searchParams.get("q")
  const isSearchPage = pathname === `/${goConfig("routes.search")}`

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
      if (
        typeof window.wt_mcp_hide !== "undefined" &&
        typeof window.wt_mcp_hide.show === "function"
      ) {
        window.wt_mcp_hide.show()
        window.wt_mcp_hide.show = () => {}
      }
    }

    firstScript?.parentNode?.insertBefore(script, firstScript)
  }, [domain, id])

  // Track SPA navigations. Depends on the search query too, so a new search on
  // the search page (which only changes the `q` param, not the pathname) also
  // triggers a pageupdate. Collect the on-site search term (OSS) while on the
  // search page so the page view carries it — reused from the React apps.
  useEffect(() => {
    if (isSearchPage && searchQuery) {
      collectPageStatistics(statistics.searchQuery, searchQuery)
    } else {
      clearPageStatistics(statistics.searchQuery)
    }

    // Skip the initial page load — Mapp sends that page view automatically
    // (it still reads the parameters we just collected on window._ti).
    if (isInitialLoad.current) {
      isInitialLoad.current = false
      return
    }

    sendPageUpdate()
  }, [pathname, searchQuery, isSearchPage])

  return null
}
