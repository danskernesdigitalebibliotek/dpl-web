import { argosScreenshot } from "@argos-ci/storybook/test-runner";
import {
  assertNoExternalRequests,
  blockExternalRequests,
} from "./external-requests";

export default {
  tags: {
    // For stories that cannot be screenshotted reliably at all.
    exclude: ["skip-ui-tests"],
  },
  async preVisit(page) {
    await blockExternalRequests(page);
  },
  async postVisit(page, context) {
    // Leave the render error as the story's failure.
    if (context.hasFailure) {
      return;
    }

    await argosScreenshot(page, context);
    // After the screenshot, as Argos renders the story again for each mode.
    assertNoExternalRequests(page);
  },
};
