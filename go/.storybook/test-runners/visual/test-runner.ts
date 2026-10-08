import { argosScreenshot } from "@argos-ci/storybook/test-runner"
import type { TestRunnerConfig } from "@storybook/test-runner"

const config: TestRunnerConfig = {
  tags: {
    // For stories that cannot be screenshotted reliably at all.
    exclude: ["skip-ui-tests"],
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
