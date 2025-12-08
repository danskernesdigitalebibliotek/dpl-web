import type { TestRunnerConfig } from "@storybook/test-runner"
import { checkA11y, injectAxe } from "axe-playwright"

const config: TestRunnerConfig = {
  async preVisit(page) {
    await injectAxe(page)
    // Add a delay to wait for all animations to finish
    await page.waitForTimeout(2000)
  },
  async postVisit(page) {
    // Ensure all animations are complete before running accessibility checks
    await page.waitForTimeout(2000)

    await checkA11y(page, "#storybook-root", {
      axeOptions: { preload: true },
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      verbose: true,
    })
  },
}

export default config
