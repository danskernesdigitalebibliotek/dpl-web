import "keen-slider/keen-slider.min.css"
import React from "react"

import { MediaImage, NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"

import Slider from "./Slider"
import loadCategories from "./loadCategories"

export type TNodeGoCategory = {
  categoryMenuImage: MediaImage
  changed: {
    timestamp: string
  }
} & NodeGoCategory

async function CategorySlider() {
  const data = await loadCategories()

  const categories = data?.goCategories?.results as TNodeGoCategory[] | undefined

  if (!categories) {
    return null
  }

  // Sort categories by timestamp
  const sortedCategories = categories.sort((a, b) => {
    const aTimestamp = new Date(a.changed.timestamp)
    const bTimestamp = new Date(b.changed.timestamp)
    return bTimestamp.getTime() - aTimestamp.getTime()
  })

  return (
    <div className="-my-[12px] overflow-hidden lg:-my-[20px]">
      <div className="content-container w-full">
        <Slider className="col-span-12" categories={sortedCategories} />
      </div>
    </div>
  )
}

export default CategorySlider
