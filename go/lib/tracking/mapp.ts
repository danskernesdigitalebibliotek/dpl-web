// Generic Mapp Intelligence tracking primitives.
//
// Mirrors the React apps' react/src/core/statistics/useStatistics.ts, split
// into two mechanisms:
//
//   - collectPageStatistics: writes a parameter onto `window._ti`. It is sent
//     with the next page view / pageupdate. Use for values tied to a page —
//     they do NOT all need to be present at page load; collect them as they
//     become available and flush with sendPageUpdate().
//   - trackEvent: pushes a discrete "click"/"link" event to `window.wts`
//     immediately. Use for user actions that happen after page load.
//
// These are plain functions (not hooks) so any client component or event
// handler can track. They no-op when Mapp is not configured (window.wts /
// window._ti absent), mirroring the rest of MappTracking which stays silent
// when there is no domain/id.
import { TStatisticsEntry } from "./statistics"

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

// Mapp event types (see React useStatistics EventType). "click" measures
// actions without a page load; "link" measures clicks that trigger one.
export type TEventType = "click" | "link"

/**
 * Collects a page parameter onto `window._ti`, to be sent with the next page
 * view / pageupdate. Entries with an empty `parameterName` are event-only and
 * ignored here. Mirrors React's collectPageStatistics.
 */
export const collectPageStatistics = ({ parameterName }: TStatisticsEntry, trackedData: string) => {
  if (typeof window === "undefined" || !parameterName) return

  // eslint-disable-next-line no-underscore-dangle
  window._ti = window._ti || {}
  // eslint-disable-next-line no-underscore-dangle
  window._ti[parameterName] = trackedData
}

/**
 * Removes a previously collected page parameter — e.g. when leaving the page
 * it belongs to, so it does not leak into unrelated page views.
 */
export const clearPageStatistics = ({ parameterName }: TStatisticsEntry) => {
  // eslint-disable-next-line no-underscore-dangle
  if (typeof window === "undefined" || !parameterName || !window._ti) return

  // eslint-disable-next-line no-underscore-dangle
  delete window._ti[parameterName]
}

/**
 * Sends a discrete event to Mapp immediately. Works at any time, including
 * long after page load. Returns a promise that settles shortly after, so
 * callers that navigate away (e.g. a tracked redirect) can await it first —
 * mirrors React's useEventStatistics.track.
 */
export const trackEvent = (
  eventType: TEventType,
  { id, name }: TStatisticsEntry,
  trackedData: string
): Promise<void> => {
  if (typeof window !== "undefined" && window.wts) {
    window.wts.push([
      "send",
      eventType,
      { linkId: name, customClickParameter: { [id]: trackedData } },
    ])
  }

  return new Promise(resolve => {
    setTimeout(resolve, 500)
  })
}

/** Flushes collected page parameters to Mapp as a page update. */
export const sendPageUpdate = () => {
  if (typeof window === "undefined" || !window.wts) return

  window.wts.push(["send", "pageupdate"])
}
