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

  // Strip schema-sourced JSDoc comments (`/** ... */` blocks emitted by
  // graphql-codegen from GraphQL descriptions). Drupal localizes those
  // descriptions to whatever language pack is installed on the
  // introspected site — Danish locally, English in CI (where
  // SKIP_LANGUAGE_IMPORT is set) — so leaving them in causes pure
  // translation drift in the generated file. Removing them keeps codegen
  // output stable regardless of which language Drupal happens to be
  // configured with.
  await replaceInFile({
    files: path,
    // Matches `/** ... */` blocks (single- or multi-line) on their own
    // line, including any leading indentation and the trailing newline.
    from: /^[ \t]*\/\*\*[\s\S]*?\*\/[ \t]*\r?\n/gm,
    to: "",
  })
}

postProcess(pathToGeneratedFile).catch((error: unknown) => {
  console.error("post-process-dpl-cms-graphql failed:", error)
  process.exit(1)
})

export {}
