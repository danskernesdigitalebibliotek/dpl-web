import { Suspense } from "react"

import DebuggingSession from "./DebuggingSession"

const Page = () => {
  return (
    <div className="content-container">
      <h1 className="pb-5 text-typo-heading-3 font-bold">Profile</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <DebuggingSession />
      </Suspense>
    </div>
  )
}

export default Page
