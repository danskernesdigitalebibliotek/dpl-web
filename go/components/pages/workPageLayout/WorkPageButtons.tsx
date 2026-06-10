import React from "react"

const WorkPageButtons = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex w-full flex-col items-end space-y-3">{children}</div>
}

const Skeleton = () => (
  <WorkPageButtons>
    <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
    <div className="bg-background-skeleton h-12 w-full animate-pulse rounded-full lg:w-80" />
  </WorkPageButtons>
)

WorkPageButtons.Skeleton = Skeleton

export default WorkPageButtons
