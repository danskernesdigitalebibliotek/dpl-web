import React from "react"

function Page({ searchParams, queryParams }) {
  return (
    <div>
      <pre>{JSON.stringify(queryParams, null, 2)}</pre>
      <pre>{JSON.stringify(searchParams, null, 2)}</pre>
      Page
    </div>
  )
}

export default Page
