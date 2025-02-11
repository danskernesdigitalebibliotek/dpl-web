// TODO: This folder has been commented out due to a codegenerating error that we
// decided to proceed to fix once we work on the article page during a future sprint.

// import { Suspense } from "react"

// import loadArticle from "./loadArticle"

// const Page = async (props: { params: Promise<{ id: string }> }) => {
//   const params = await props.params

//   const { id } = params

//   const data = await loadArticle(id)
//   return (
//     <Suspense fallback={<p>Loading...</p>}>
//       <pre>{JSON.stringify(data, null, 2)}</pre>
//     </Suspense>
//   )
// }

// export default Page
