"use client"

import useSession from "@/hooks/useSession"

const DebuggingSession = () => {
  const session = useSession()

  return (
    <>
      <h2 className="text-typo-heading-5 mt-5">Debugging:</h2>
      <div className="mt-3">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </>
  )
}

export default DebuggingSession
