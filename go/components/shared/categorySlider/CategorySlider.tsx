"use client"

import { useWindowSize } from "@uidotdev/usehooks"
import { motion } from "framer-motion"
import { KeenSliderOptions, useKeenSlider } from "keen-slider/react"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"

import { WheelControls } from "@/components/paragraphs/MaterialSlider/helper"
import { MediaImage, NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import ImageBase from "../image/ImageBase"
import SmartLink from "../smartLink/SmartLink"
import loadCategories from "./loadCategories"

export const sliderOptions: KeenSliderOptions = {
  initial: 0,
  slides: {
    origin: "auto",
    spacing: -12,
    perView: () => {
      return 3.5
    },
  },
  breakpoints: {
    "(min-width: 1024px)": {
      slides: {
        spacing: -24,
        perView: () => {
          return 6.5
        },
      },
    },
  },
}

export type TNodeGoCategory = {
  categoryMenuImage: MediaImage
  changed: {
    timestamp: string
  }
} & NodeGoCategory

function CategorySlider() {
  const [sliderRef, categorySlider] = useKeenSlider(sliderOptions, [WheelControls])
  const size = useWindowSize()
  const [categories, setCategories] = useState<TNodeGoCategory[] | false>(false)
  const pathname = usePathname()

  useEffect(() => {
    categorySlider.current?.update()

    if (categories) {
      return
    }

    loadCategories().then(data => {
      const categories = data?.goCategories?.results as TNodeGoCategory[] | undefined
      setCategories(categories || [])
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories])

  // If window size changes, update the slider
  useEffect(() => {
    categorySlider.current?.update()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size.width])

  return (
    <div
      // This div is used to set the height of the slider based on the viewport width and the number of slides + padding
      // The height needs to is calculated because the categories are loaded dynamically
      className="h-[calc((100vw-var(--grid-edge)*2)/3.5+36px)]
        lg:h-[min(calc((100vw-var(--grid-edge)*2)/6.5+54px),calc(((1600px-var(--grid-edge)*2)/6.5)+54px))]">
      {categories && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          ref={sliderRef}
          className={cn(
            `keen-slider relative z-10 w-full !overflow-visible opacity-0 transition-opacity
            duration-300`
          )}>
          {categories.map((category, index) => (
            <CategorySlide
              isSelected={pathname === category.path}
              key={index}
              category={category}
              index={index}
            />
          ))}
        </motion.div>
      )}
    </div>
  )
}

function CategorySlide({
  category,
  index,
  isSelected,
}: {
  category: TNodeGoCategory
  index: number
  isSelected: boolean
}) {
  const [randomIndex, setRandomIndex] = useState<number>(0)

  // Rotation effect options
  const rotations = [
    "has-checked:rotate-2",
    "has-checked:rotate-3",
    "has-checked:rotate-4",
    "has-checked:rotate-5",
    "has-checked:rotate-6",
    "has-checked:-rotate-2",
    "has-checked:-rotate-3",
    "has-checked:-rotate-4",
    "has-checked:-rotate-5",
    "has-checked:-rotate-6",
  ]

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * rotations.length)
    setRandomIndex(randomIndex)
  }, [rotations.length])

  return (
    <div className="keen-slider__slide !overflow-visible" key={category.id}>
      <SmartLink
        aria-label={`Gå til kategori ${category.categoryMenuTitle}`}
        href={category.path || ""}
        className={cn(
          `group flex h-full w-full cursor-pointer flex-col gap-y-2 !overflow-visible p-[12px]
          ring-0 outline-0 transition-all duration-200 lg:p-[24px]`,
          isSelected ? `${rotations[randomIndex]}` : ""
        )}>
        <div
          className={cn(
            `bg-background-overlay relative flex aspect-1/1 items-center justify-center
            overflow-hidden rounded-sm transition-all duration-300 forced-colors:hidden`,
            // Add hover effect based on every category by fourth index
            index % 4 === 0 &&
              "group-hover:bg-content-1 group-focus:bg-content-1 group-has-checked:bg-content-1",
            index % 4 === 1 &&
              "group-hover:bg-content-2 group-focus:bg-content-2 group-has-checked:bg-content-2",
            index % 4 === 2 &&
              "group-hover:bg-content-3 group-focus:bg-content-3 group-has-checked:bg-content-3",
            index % 4 === 3 &&
              "group-hover:bg-content-4 group-focus:bg-content-4 group-has-checked:bg-content-4"
          )}>
          {category.categoryMenuImage.mediaImage.url && (
            <ImageBase
              className="grayscale-100 transition-all duration-300 group-hover:grayscale-0
                group-focus:grayscale-0 group-has-checked:grayscale-0"
              sizes="10vw"
              imageSizing="intrinsic"
              src={category.categoryMenuImage.mediaImage.url}
              width={category.categoryMenuImage.mediaImage.width}
              height={category.categoryMenuImage.mediaImage.height}
              alt={category.categoryMenuImage.mediaImage?.alt || ""}
            />
          )}

          <input
            type="radio"
            name="category"
            checked={isSelected}
            className="pointer-events-none appearance-none"
            disabled
          />
        </div>
        <p className="text-typo-subtitle-sm text-center">{category.categoryMenuTitle}</p>
      </SmartLink>
    </div>
  )
}

export default CategorySlider
