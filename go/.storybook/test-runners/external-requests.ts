import type { Page } from "playwright"

// Requests outside the Storybook that stories may make, as Playwright URL
// globs.
const allowedRequests = [
  // Reserved for examples (RFC 2606), so no server answers: stories point APIs
  // here to have unseeded requests fail.
  "https://*.example/**",
  // The videotool player and the CDNs it loads from, which render the same from
  // run to run.
  "https://*.videotool.dk/**",
]

// The current story's requests outside the served Storybook, per page.
const externalRequests = new WeakMap<Page, string[]>()

// Stories may only load the Storybook's own files: anything else makes their
// screenshots depend on another server.
export const blockExternalRequests = async (page: Page) => {
  // The test runner reuses a page for all stories in a file.
  if (!externalRequests.has(page)) {
    const storybookOrigin = new URL(process.env.TARGET_URL as string).origin
    await page.route(
      url => url.origin !== storybookOrigin,
      route => {
        externalRequests.get(page)?.push(route.request().url())
        return route.abort()
      }
    )
    // Registered later, so they handle their requests first.
    for (const allowedRequest of allowedRequests) {
      await page.route(allowedRequest, route => route.continue())
    }
  }
  externalRequests.set(page, [])
}

export const assertNoExternalRequests = (page: Page) => {
  const urls = [...new Set(externalRequests.get(page))]
  if (urls.length > 0) {
    throw new Error(`The story loads files from outside the Storybook:\n${urls.join("\n")}`)
  }
}
