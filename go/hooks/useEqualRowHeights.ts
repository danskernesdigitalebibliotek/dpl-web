"use client"

import { useCallback, useEffect, useRef } from "react"

// Items that wrapped onto the same line share a top within a pixel or two, so
// the tolerance absorbs sub-pixel layout without merging two real rows.
const ROW_TOLERANCE_PX = 2

/**
 * Makes the marked element in each card as tall as its tallest counterpart on
 * the same row of a wrapped flex or grid container.
 *
 * CSS cannot do this on its own: the cards are siblings, so no selector reaches
 * from one card's block to another's, and flex only equalises whole items.
 *
 * Every participating element carries the same `[data-equal-row]` value, which
 * is how a card finds the others it shares a row with. Measuring runs after
 * layout, after fonts settle, and whenever the container resizes — a different
 * width means different rows.
 */
export const useEqualRowHeight = (group: string) => {
  const ref = useRef<HTMLDivElement | null>(null)

  const measure = useCallback(() => {
    const element = ref.current
    if (!element) return

    const peers = [...document.querySelectorAll<HTMLElement>(`[data-equal-row="${group}"]`)].filter(
      peer => peer.isConnected
    )
    if (peers.length === 0) return

    // The natural height is what rows are built from, so any height a previous
    // pass applied is cleared before reading.
    peers.forEach(peer => {
      peer.style.minHeight = ""
    })

    // Rows are grouped by the CARD's top, not the block's: the blocks are
    // pushed to their own card's bottom, so two blocks on one row start at
    // different heights and their own tops would split the row in two.
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
    // Every card runs this effect, so the work is deferred to one frame: the
    // last card to mount measures a layout where all of them are present, and
    // the earlier passes are harmless no-ops against the same final state.
    const frame = requestAnimationFrame(measure)

    // Rows are decided by the container width, so a resize can move a card onto
    // another row and change the height it should take.
    const observer = new ResizeObserver(() => measure())
    const container = ref.current?.closest("[data-equal-row-container]") ?? document.body
    observer.observe(container)

    // A font swap changes text height after the first measurement.
    document.fonts?.ready.then(measure).catch(() => {})

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  })

  return { ref, groupAttribute: { "data-equal-row": group } }
}
