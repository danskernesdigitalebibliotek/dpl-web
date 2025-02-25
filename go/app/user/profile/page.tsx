import { Suspense } from "react"

import DebuggingSession from "./DebuggingSession"
import LogoutButton from "./LogoutButton"

const Page = () => {
  return (
    <div className="content-container">
      <h1 className="text-typo-heading-3 pb-5 font-bold">Profile</h1>
      <Suspense fallback={<p>Loading...</p>}>
        <LogoutButton />
        <DebuggingSession />
      </Suspense>
    </div>
  )
}

export default Page
