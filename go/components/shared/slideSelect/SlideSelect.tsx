import { motion } from "framer-motion"
import React, { useOptimistic, useTransition } from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { cyKeys } from "@/cypress/support/constants"
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
  // useOptimistic to immediately reflect the selected option in the UI
  const [optimisticSelected, setOptimisticSelected] = useOptimistic(selected)
  const [, startTransition] = useTransition()
  // find the index of the selected option
  const selectedOptionIndex = options.findIndex(option => option.code === optimisticSelected)

  return (
    <div
      className="border-background outline-foreground relative flex w-full max-w-[500px] flex-row flex-nowrap
        justify-center overflow-hidden rounded-full border-2 outline-2">
      {/* Animated black background */}
      <motion.div
        className="bg-foreground absolute h-7 w-auto rounded-full"
        layout // Framer Motion automatically animates layout changes
        initial={false} // Prevents the initial animation
        transition={{
          type: "spring",
          stiffness: 900,
          damping: 25,
        }}
        style={{
          width: `calc(${100 / options.length}%)`, // Dynamic width based on the number of options
          left: `calc(${(100 / options.length) * selectedOptionIndex}%)`, // Moves to the selected option
        }}
      />
      {/* Render the options */}
      {options.map((option, index) => {
        const iconName = getIconNameFromMaterialType(option.code)

        return (
          <BadgeButton
            key={index}
            data-cy={cyKeys[`slide-select-option`]}
            ariaLabel={
              selectedOptionIndex === index
                ? `Nu viser materialet som ${option.display}`
                : `Skift til visning af ${option.display}`
            }
            onClick={() => {
              startTransition(() => {
                onOptionSelect(option)
                // Use optimistic update to immediately reflect the selection
                // in the UI while the actual state update happens
                setOptimisticSelected(option.code)
              })
            }}
            variant="transparent"
            classNames={cn(
              "z-slide-select flex items-center justify-center min-w-0 flex-1 ",
              selectedOptionIndex === index && "text-background"
            )}>
            {!!iconName && (
              <Icon
                className="m-[-7px] block h-7 w-7 shrink-0 lg:hidden xl:block"
                name={iconName}
              />
            )}
            <span>{option.display}</span>
          </BadgeButton>
        )
      })}
    </div>
  )
}

export const SlideSelectSkeleton = () => {
  return <div className="bg-background-skeleton h-[40px] w-60 animate-pulse rounded-full" />
}

export default SlideSelect
