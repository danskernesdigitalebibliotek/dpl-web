import React from "react"

const Fonts = () => {
  return (
    <div className="space-y-10">
      <h1 className="text-typo-huge">{process.env.NEXT_PUBLIC_APP_URL}</h1>
      <h1 className="text-typo-huge">{process.env.UNILOGIN_SESSION_SECRET}</h1>

      <h1 className="text-typo-huge">text-typo-huge</h1>
      <h1 className="text-typo-heading-1">text-typo-heading-1</h1>
      <h2 className="text-typo-heading-2">text-typo-heading-2</h2>
      <h3 className="text-typo-heading-3">text-typo-heading-3</h3>
      <h4 className="text-typo-heading-4">text-typo-heading-4</h4>
      <h5 className="text-typo-heading-5">text-typo-heading-5</h5>
      <p className="text-typo-subtitle-lg">text-typo-subtitle-lg</p>
      <p className="text-typo-subtitle-md">text-typo-subtitle-md</p>
      <p className="text-typo-subtitle-sm">text-typo-subtitle-sm</p>
      <p className="text-typo-body-lg">text-typo-body-lg</p>
      <p className="text-typo-body-md">text-typo-body-md</p>
      <p className="text-typo-body-sm">text-typo-body-sm</p>
      <p className="text-typo-button-lg">text-typo-button-lg</p>
      <p className="text-typo-button-sm">text-typo-button-sm</p>
      <p className="text-typo-link">text-typo-link</p>
      <p className="text-typo-tag-lg">text-typo-tag-lg</p>
      <p className="text-typo-tag-sm">text-typo-tag-sm</p>
      <p className="text-typo-caption">text-typo-caption</p>
    </div>
  )
}

export default Fonts
