import { motion } from "framer-motion"
import React, { useState } from "react"

import { cn } from "@/lib/helpers/helper.cn"

import BadgeButton from "../badge/BadgeButton"

export type SlideSelectOption = {
  value: string
  render: string
}

export type SlideSelectProps = {
  options: SlideSelectOption[]
  onOptionSelect: (option: SlideSelectOption) => void
}

const SlideSelect = ({ options, onOptionSelect }: SlideSelectProps) => {
  const [selected, setSelected] = useState<number>(0)

  return (
    <div className="relative flex flex-row flex-wrap justify-center rounded-full border-2 border-foreground p-1">
      {/* Animated black background */}
      <motion.div
        className="absolute top-1 z-[0] h-7 w-auto rounded-full bg-foreground"
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
                ? `Nu viser materialet som ${option}`
                : `Skift til visning af ${option}`
            }
            onClick={() => {
              setSelected(index)
              onOptionSelect(option)
            }}
            variant="transparent"
            classNames={cn("z-[10] w-28", selected === index && "text-background")}>
            {option.render}
          </BadgeButton>
        )
      })}
    </div>
  )
}

export default SlideSelect
