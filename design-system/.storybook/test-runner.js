import { argosScreenshot } from "@argos-ci/storybook/test-runner";

// The test runner reuses a page for every story in a file.
const routedPages = new WeakSet();

export default {
  async preVisit(page) {
    if (routedPages.has(page)) {
      return;
    }
    routedPages.add(page);

    // Argos waits for network idle before each screenshot, which Playwright
    // stops reporting once the embed's iframe loads after the page's other
    // requests (microsoft/playwright#42598). The consent placeholder covers
    // the player anyway.
    await page.route(/^https:\/\/www\.youtube\.com\//, (route) =>
      route.abort(),
    );
  },
  async postVisit(page, context) {
    await argosScreenshot(page, context);
  },
};
