import { replaceInFile } from "replace-in-file"

const args: string[] = process.argv.slice(2)
const pathToGeneratedFile = args[0] ?? null

if (!pathToGeneratedFile) {
  throw new Error("Missing path to generated file!")
}

async function postProcess(path: string) {
  // Replace RequestInit['headers'] with RequestInit since we need to be
  // able to inject next options in the fetcher.
  await replaceInFile({
    files: path,
    from: /RequestInit\['headers'\]/g,
    to: "RequestInit & { next?: NextFetchRequestConfig }",
  })

  // Our fetcher returns go cache tags along with the data.
  await replaceInFile({
    files: path,
    from: /Query = {/g,
    to: "Query = { go: { cacheTags: string[] } } & {",
  })
}

postProcess(pathToGeneratedFile).catch((error: unknown) => {
  console.error("post-process-dpl-cms-graphql failed:", error)
  process.exit(1)
})

export {}
