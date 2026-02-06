import React from "react"

import { getEnv } from "../config/env"

interface WithVisibilityProps {
  hideInProduction?: boolean
}

export default function withVisibility<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const ComponentWithVisibility = ({ hideInProduction, ...props }: P & WithVisibilityProps) => {
    if (getEnv("NODE_ENV") === "production" && hideInProduction) {
      return null
    }
    return <WrappedComponent {...(props as P)} />
  }

  return ComponentWithVisibility
}
