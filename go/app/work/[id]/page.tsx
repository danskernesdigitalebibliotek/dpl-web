import React from "react"

function Page({ params: { id } }: { params: { id: string } }) {

  

  return (
    <div>
      <pre>{JSON.stringify(id, null, 2)}</pre>
      Page
    </div>
  )
}

export default Page
