"use client"

import { type Variants, motion } from "framer-motion"
import React from "react"

import { WorkCardSkeleton } from "@/components/shared/workCard/WorkCard"
import WorkTeaser from "@/components/shared/workTeaser/WorkTeaser"
import { getWorkTeaserProps } from "@/components/shared/workTeaser/helper"
import { WorkTeaserSearchPageFragment } from "@/lib/graphql/generated/fbi/graphql"

type SearchResultProps = {
  works: WorkTeaserSearchPageFragment[]
  // Works per row on large screens.
  columns?: 3 | 4
  // The works come in one after the other when scrolled into view, and leave
  // together when removed inside an AnimatePresence.
  animated?: boolean
}

// Literal classes per column count, so Tailwind finds them.
const ITEM_CLASSES = {
  3: "col-span-3 lg:col-span-4",
  4: "col-span-3 lg:col-span-3",
}

// The list only sets the pace. Without `animated` it names no variant, so the
// works stay still.
const LIST_VARIANTS: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: 0.07 } },
  exit: { transition: { staggerChildren: 0.03 } },
}

const WORK_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.94 },
  shown: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 260, damping: 22 },
  },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.15 } },
}

const SearchResults = ({ works, columns = 3, animated = false }: SearchResultProps) => {
  return (
    <motion.div
      className="grid-go gap-x-grid-gap-x gap-y-[calc(var(--grid-gap-x)*2)]"
      variants={LIST_VARIANTS}
      {...(animated && {
        initial: "hidden",
        whileInView: "shown",
        exit: "exit",
        viewport: { once: true, amount: 0.15 },
      })}>
      {works.map(work => {
        const { title, creators, url, cover, manifestations } = getWorkTeaserProps(work)
        return (
          <motion.div key={work.workId} className={ITEM_CLASSES[columns]} variants={WORK_VARIANTS}>
            <WorkTeaser
              title={title}
              creators={creators}
              url={url}
              cover={cover}
              manifestations={manifestations}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export const SearchResultsSkeleton = ({
  count = 6,
  columns = 3,
}: {
  count?: number
  columns?: 3 | 4
}) => {
  const skeletonItems = Array.from({ length: count })

  return (
    <div className="grid-go gap-y-[calc(var(--grid-gap-x)*2)]">
      {skeletonItems.map((_, index) => (
        <div className={ITEM_CLASSES[columns]} key={index}>
          <WorkCardSkeleton />
        </div>
      ))}
    </div>
  )
}

export default SearchResults
