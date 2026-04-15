import { motion } from "framer-motion"
import React, { useOptimistic, useTransition } from "react"

import { getIconNameFromMaterialType } from "@/components/pages/workPageLayout/helper"
import { cyKeys } from "@/cypress/support/constants"
import { cn } from "@/lib/helpers/helper.cn"

import Icon from "../icon/Icon"

export type MaterialTypeSelectOption = {
  code: string
  display: string
}

export type MaterialTypeSelectProps = {
  options: MaterialTypeSelectOption[]
  selected: string
  onOptionSelect: (option: MaterialTypeSelectOption) => void
}

const MaterialTypeSelect = ({ options, selected, onOptionSelect }: MaterialTypeSelectProps) => {
  const [optimisticSelected, setOptimisticSelected] = useOptimistic(selected)
  const [, startTransition] = useTransition()

  return (
    <div className="flex flex-row flex-wrap items-center justify-center gap-2">
      {options.map(option => {
        const isSelected = option.code === optimisticSelected
        const iconName = getIconNameFromMaterialType(option.code)

        return (
          <motion.button
            key={option.code}
            data-cy={cyKeys[`slide-select-option`]}
            aria-label={
              isSelected
                ? `Nu viser materialet som ${option.display}`
                : `Skift til visning af ${option.display}`
            }
            onClick={() => {
              startTransition(() => {
                onOptionSelect(option)
                setOptimisticSelected(option.code)
              })
            }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.06 }}
            className={cn(
              `focus-visible text-typo-caption relative flex h-auto flex-row items-center gap-2
              rounded-full px-4 py-1.5 whitespace-nowrap hover:cursor-pointer`,
              isSelected ? "text-background" : "bg-background-overlay text-foreground"
            )}>
            {isSelected && (
              <motion.span
                layoutId="material-type-pill"
                className="bg-foreground absolute inset-0 rounded-full"
                transition={{ type: "spring", stiffness: 500, damping: 32, mass: 1 }}
              />
            )}
            <motion.span
              className="relative z-10 flex flex-row items-center gap-3"
              animate={{ scale: isSelected ? 1 : 0.96, opacity: isSelected ? 1 : 0.75 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              {!!iconName && (
                <motion.span
                  className="flex"
                  animate={isSelected ? { rotate: [0, -12, 10, -6, 0] } : { rotate: 0 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}>
                  <Icon className="m-[-7px] block h-5 w-5 shrink-0" name={iconName} />
                </motion.span>
              )}
              <span>{option.display}</span>
            </motion.span>
          </motion.button>
        )
      })}
    </div>
  )
}

export const MaterialTypeSelectSkeleton = () => {
  return (
    <div className="flex flex-row flex-wrap justify-center gap-2">
      <div className="bg-background-skeleton h-[25px] w-24 animate-pulse rounded-full" />
      <div className="bg-background-skeleton h-[25px] w-28 animate-pulse rounded-full" />
      <div className="bg-background-skeleton h-[25px] w-20 animate-pulse rounded-full" />
    </div>
  )
}

export default MaterialTypeSelect
