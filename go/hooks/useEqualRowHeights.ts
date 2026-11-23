"use client"

import { useCallback, useEffect, useRef } from "react"

// Items on the same line share a top within a pixel or two.
const ROW_TOLERANCE_PX = 2

// One pending measure per group, so N cards cost one pass.
const pendingFrames = new Map<string, number>()

const scheduleMeasure = (group: string, measure: () => void) => {
  const pending = pendingFrames.get(group)
  if (pending !== undefined) cancelAnimationFrame(pending)
  pendingFrames.set(
    group,
    requestAnimationFrame(() => {
      pendingFrames.delete(group)
      measure()
    })
  )
}

/**
 * Makes the marked element in each card as tall as its tallest counterpart on
 * the same row of a wrapped flex or grid container.
 *
 * Participating elements share one `[data-equal-row]` value. Measuring runs
 * after layout, after fonts settle, and on container resize.
 */
export const useEqualRowHeight = <T extends HTMLElement = HTMLDivElement>(group: string) => {
  const ref = useRef<T | null>(null)

  const measure = useCallback(() => {
    const element = ref.current
    if (!element) return

    const peers = [...document.querySelectorAll<HTMLElement>(`[data-equal-row="${group}"]`)].filter(
      peer => peer.isConnected
    )
    if (peers.length === 0) return

    // Clear a previous pass's height to read the natural one.
    peers.forEach(peer => {
      peer.style.minHeight = ""
    })

    // Grouped by the card's top: the blocks sit at their own card's bottom, so
    // their tops differ within a row.
    const measured = peers.map(peer => {
      const row = peer.closest("[data-equal-row-item]") ?? peer
      return {
        peer,
        top: row.getBoundingClientRect().top,
        height: peer.getBoundingClientRect().height,
      }
    })

    const rows: (typeof measured)[] = []
    measured
      .slice()
      .sort((a, b) => a.top - b.top)
      .forEach(entry => {
        const row = rows.find(
          candidate => Math.abs(candidate[0].top - entry.top) <= ROW_TOLERANCE_PX
        )
        if (row) {
          row.push(entry)
          return
        }
        rows.push([entry])
      })

    rows.forEach(row => {
      const tallest = Math.max(...row.map(entry => entry.height))
      row.forEach(entry => {
        entry.peer.style.minHeight = `${tallest}px`
      })
    })
  }, [group])

  useEffect(() => {
    // Deferred to one frame, so the last card to mount measures a layout
    // holding all of them.
    scheduleMeasure(group, measure)

    // The container width decides the rows, so a resize re-measures.
    const observer = new ResizeObserver(() => scheduleMeasure(group, measure))
    const container = ref.current?.closest("[data-equal-row-container]") ?? document.body
    observer.observe(container)

    // Text growing taller — a larger browser text size — leaves the container
    // width untouched, so the element's own content is watched as well. A pass
    // writes minHeight on the element itself, and the clear it does first comes
    // back here as one extra resize; that pass settles on the same heights, so
    // the chain stops there.
    const content = [...(ref.current?.children ?? [])]
    content.forEach(child => observer.observe(child))

    // A font swap changes text height. The promise cannot be cancelled, so the
    // flag stops a late resolve on an unmounted card.
    let cancelled = false
    document.fonts?.ready
      .then(() => {
        if (!cancelled) measure()
      })
      .catch(() => {})

    return () => {
      cancelled = true
      observer.disconnect()
    }
  }, [group, measure])

  return { ref, groupAttribute: { "data-equal-row": group } }
}
