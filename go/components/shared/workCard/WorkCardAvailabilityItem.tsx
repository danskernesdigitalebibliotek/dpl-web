import React from "react"

import Icon from "../icon/Icon"

type WorkCardAvailabilityItemProps = {
  iconName: "book" | "headphones" | "controller" | "video"
}

const WorkCardAvailabilityItem = ({ iconName }: WorkCardAvailabilityItemProps) => {
  return (
    <div className="h-6 w-6 rounded-full bg-background-overlay md:h-10 md:w-10">
      <Icon className="h-6 w-6 md:h-10 md:w-10" name={iconName} />
    </div>
  )
}

export default WorkCardAvailabilityItem
