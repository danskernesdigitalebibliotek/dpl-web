import React from "react"

const WorkPageButtons = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex w-full flex-col items-end space-y-3">{children}</div>
}

export default WorkPageButtons
