"use client"

import { useEffect } from "react"

import { categoryStore } from "@/store/category.store"

function CategorySliderTrigger({ showCategorySlider }: { showCategorySlider: boolean }) {
  const { setShowCategorySlider } = categoryStore.trigger
  useEffect(() => {
    setShowCategorySlider({ showCategorySlider: showCategorySlider })
  }, [setShowCategorySlider, showCategorySlider])

  return <></>
}

export default CategorySliderTrigger
