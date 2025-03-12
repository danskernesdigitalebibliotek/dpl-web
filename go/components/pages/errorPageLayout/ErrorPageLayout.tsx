import React, { ReactNode } from "react"

const ErrorPageLayout = ({ lines }: { lines: (string | ReactNode)[] }) => {
  return (
    <div className="content-container flex items-center justify-center">
      <div className="bg-white p-8 text-center shadow-md">
        <h1 className="text-typo-heading-3 mb-6 font-bold">{lines[0]}</h1>
        {lines.slice(1).map((line, index) => (
          <p key={index} className="mb-6">
            {line}
          </p>
        ))}
      </div>
    </div>
  )
}

export default ErrorPageLayout
