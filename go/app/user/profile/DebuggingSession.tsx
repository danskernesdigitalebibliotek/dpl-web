"use client"

import useSession from "@/hooks/useSession"
import withVisibility from "@/lib/helpers/visibility"

const DebuggingSession = () => {
  const session = useSession()

  return (
    <>
      <h2 className="text-typo-heading-5 col-span-full mt-40">Debugging:</h2>
      <div className="col-span-full mt-3">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </>
  )
}

export default withVisibility(DebuggingSession)
