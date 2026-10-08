import { argosScreenshot } from "@argos-ci/storybook/test-runner";

export default {
  async postVisit(page, context) {
    await argosScreenshot(page, context);
  },
};
