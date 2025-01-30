import { motion } from "framer-motion"
import React from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { GeneralMaterialTypeCodeEnum } from "@/lib/graphql/generated/fbi/graphql"
import { cn } from "@/lib/helpers/helper.cn"

import BadgeButton from "../badge/BadgeButton"
import Icon from "../icon/Icon"

export type SlideSelectOption = {
  code: GeneralMaterialTypeCodeEnum
  display: string
}

export type SlideSelectProps = {
  options: SlideSelectOption[]
  selected: GeneralMaterialTypeCodeEnum
  onOptionSelect: (option: SlideSelectOption) => void
}

const SlideSelect = ({ options, selected, onOptionSelect }: SlideSelectProps) => {
  // find the index of the selected option
  const selectedOptionIndex = options.findIndex(option => option.code === selected)

  return (
    <div
      className="relative flex max-w-full flex-row flex-nowrap justify-center rounded-full border-2 border-foreground
        p-1">
      {/* Animated black background */}
      <motion.div
        className="absolute top-1 h-7 w-auto rounded-full bg-foreground"
        layout // Framer Motion automatically animates layout changes
        initial={false} // Prevents the initial animation
        transition={{
          type: "spring",
          stiffness: 900,
          damping: 25,
        }}
        style={{
          width: `calc(${100 / options.length}% - 8px)`, // Dynamic width based on the number of options
          left: `calc(${(100 / options.length) * selectedOptionIndex}% + 4px)`, // Moves to the selected option
        }}
      />
      {/* Render the options */}
      {options.map((option, index) => {
        const iconName = getIconNameFromMaterialType(option.code)

        return (
          <BadgeButton
            key={index}
            ariaLabel={
              selectedOptionIndex === index
                ? `Nu viser materialet som ${option.display}`
                : `Skift til visning af ${option.display}`
            }
            onClick={() => {
              onOptionSelect(option)
            }}
            variant="transparent"
            classNames={cn(
              "z-slide-select min-w-36 flex items-center justify-center",
              selectedOptionIndex === index && "text-background"
            )}>
            {!!iconName && <Icon className="m-[-7px] h-7 w-7 shrink-0" name={iconName} />}
            <span>{option.display}</span>
          </BadgeButton>
        )
      })}
    </div>
  )
}

export const SlideSelectSkeleton = () => {
  return <div className="h-[40px] w-60 animate-pulse rounded-full bg-background-skeleton" />
}

export default SlideSelect
