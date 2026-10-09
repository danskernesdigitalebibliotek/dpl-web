import { argosScreenshot } from "@argos-ci/storybook/test-runner"
import type { TestRunnerConfig } from "@storybook/test-runner"
import type { Page } from "playwright"

const pagesWithoutNetworkIdle = new WeakSet<Page>()

// Argos waits for network idle before its screenshots, which Playwright
// discourages and stops reporting when a page that has made a request since
// it was last idle loads an iframe. Wait for every frame to load instead.
const replaceNetworkIdleWithFrameLoads = (page: Page) => {
  // The test runner reuses a page for all stories in a file.
  if (pagesWithoutNetworkIdle.has(page)) {
    return
  }
  pagesWithoutNetworkIdle.add(page)
  const waitForLoadState = page.waitForLoadState.bind(page)
  page.waitForLoadState = async (state, options) => {
    if (state !== "networkidle") {
      return waitForLoadState(state, options)
    }
    await Promise.all(
      page.frames().map(frame =>
        frame
          .waitForLoadState("load", options)
          // The frame may have been removed.
          .catch(() => {})
      )
    )
  }
}

const config: TestRunnerConfig = {
  tags: {
    // For stories that cannot be screenshotted reliably at all.
    exclude: ["skip-ui-tests"],
  },
  async preVisit(page) {
    replaceNetworkIdleWithFrameLoads(page)
  },
  async postVisit(page, context) {
    // Leave the render error as the story's failure.
    if (context.hasFailure) {
      return
    }

    await argosScreenshot(page, context)
  },
}

export default config
