"use client"

import { KeenSliderOptions, useKeenSlider } from "keen-slider/react"
import { usePathname } from "next/navigation"
import React, { useEffect, useState } from "react"

import { WheelControls } from "@/components/paragraphs/MaterialSlider/helper"
import { MediaImage, NodeGoCategory } from "@/lib/graphql/generated/dpl-cms/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import ImageBase from "../image/ImageBase"
import SmartLink from "../smartLink/SmartLink"

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

function CategorySlider({ categories }: { categories?: TNodeGoCategory[] }) {
  const [sliderRef] = useKeenSlider(sliderOptions, [WheelControls])
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setLoaded(true)
  }, [])

  if (!categories) {
    return null
  }

  return (
    <div className="-my-[12px] overflow-hidden lg:-my-[20px]">
      <div className="content-container w-full">
        <div
          className={cn(
            `lg:w-[calc(100%+48px) w-[calc(100%+24px) relative -mx-[24px] !overflow-visible px-[12px]
            lg:-mx-[48px] lg:px-[24px]`
          )}>
          <div
            ref={sliderRef}
            className={cn(
              "keen-slider relative z-10 w-full !overflow-visible transition-opacity duration-300",
              loaded ? "m-0 opacity-100" : "opacity-0"
            )}>
            {categories.map((category, index) => {
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

              const randomIndex = Math.floor(Math.random() * rotations.length)
              const isSelected = pathname === category.path

              // eslint-disable-next-line no-console
              console.log("category.path", category.path)
              // eslint-disable-next-line no-console
              console.log("pathname", pathname)
              // eslint-disable-next-line no-console
              console.log("isSelected", isSelected)

              return (
                <div className="keen-slider__slide !overflow-visible" key={category.id}>
                  <SmartLink
                    aria-label={`Gå til kategori ${category.categoryMenuTitle}`}
                    href={category.path || ""}
                    className={cn(
                      `group flex h-full w-full cursor-pointer flex-col gap-y-2 !overflow-visible p-[12px] ring-0 outline-0
                      transition-all duration-200 lg:p-[24px]`,
                      isSelected ? `${rotations[randomIndex]}` : ""
                    )}>
                    <div
                      className={cn(
                        `bg-background-overlay relative flex aspect-1/1 items-center justify-center overflow-hidden
                        rounded-sm transition-all duration-300 forced-colors:hidden`,
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
                          className="grayscale-100 transition-all duration-300 group-hover:grayscale-0 group-focus:grayscale-0
                            group-has-checked:grayscale-0"
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
                    <p className="text-typo-subtitle-sm text-center">
                      {category.categoryMenuTitle}
                    </p>
                  </SmartLink>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CategorySlider
