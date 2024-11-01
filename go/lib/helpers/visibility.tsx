import React from "react"

import { getEnvironment } from "@/lib/helpers/helper.env"

interface WithVisibilityProps {
  hideInProduction?: boolean
}

export default function withVisibility<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithVisibility = ({ hideInProduction, ...props }: P & WithVisibilityProps) => {
    if (getEnvironment() === "production" && hideInProduction) {
      return null
    }
    return <WrappedComponent {...(props as P)} />
  }

  return ComponentWithVisibility
}
