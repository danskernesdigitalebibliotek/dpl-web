import { replaceInFile } from "replace-in-file"

const args: string[] = process.argv.slice(2)
const pathToGeneratedFile = args[0] ?? null

if (!pathToGeneratedFile) {
  throw new Error("Missing path to generated file!")
}

// Replace RequestInit['headers'] with RequestInit since
// we need to be able to inject next options in the fetcher:
replaceInFile({
  files: pathToGeneratedFile,
  from: /RequestInit\['headers'\]/g,
  to: "RequestInit",
})
  .then((results: unknown) => {
    // eslint-disable-next-line no-console
    console.log("Replacement results:", results)
  })
  .catch((error: unknown) => {
    console.error("Error occurred:", error)
  })

export {}
