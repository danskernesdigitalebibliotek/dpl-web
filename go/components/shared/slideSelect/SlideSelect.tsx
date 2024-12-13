import { motion } from "framer-motion"
import React, { useEffect, useState } from "react"

import { cn } from "@/lib/helpers/helper.cn"

import BadgeButton from "../badge/BadgeButton"
import Icon from "../icon/Icon"

export type SlideSelectOption = {
  value: string
  render: string
  icon?: string
}

export type SlideSelectProps = {
  options: SlideSelectOption[]
  initialOption?: SlideSelectOption
  onOptionSelect: (option: SlideSelectOption) => void
}

const SlideSelect = ({ options, initialOption, onOptionSelect }: SlideSelectProps) => {
  const [selected, setSelected] = useState<number>(0)

  useEffect(() => {
    if (!!initialOption) {
      setSelected(options.findIndex(option => option.value === initialOption.value))
    }
  }, [initialOption, options])

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
          left: `calc(${(100 / options.length) * selected}% + 4px)`, // Moves to the selected option
        }}
      />
      {/* Render the options */}
      {options.map((option, index) => {
        return (
          <BadgeButton
            key={option.value}
            ariaLabel={
              selected === index
                ? `Nu viser materialet som ${option.render}`
                : `Skift til visning af ${option.render}`
            }
            onClick={() => {
              setSelected(index)
              onOptionSelect(option)
            }}
            variant="transparent"
            classNames={cn("z-slide-select min-w-28", selected === index && "text-background")}>
            {!!option.icon && (
              <Icon className="m-[-7px] h-7 w-7 flex-shrink-0" name={option.icon} />
            )}
            <span>{option.render}</span>
          </BadgeButton>
        )
      })}
    </div>
  )
}

export const SlideSelectSkeleton = () => {
  return <div className="h-[40px] w-60 animate-pulse rounded-full bg-background-overlay" />
}

export default SlideSelect
