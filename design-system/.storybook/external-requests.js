// Requests outside the Storybook that stories may make, as Playwright URL
// globs.
const allowedRequests = [
  // Swiper, loaded from the CDN like the CMS theme does.
  "https://cdn.jsdelivr.net/npm/swiper@11/**",
];

// The current story's requests outside the served Storybook, per page.
const externalRequests = new WeakMap();

// Stories may only load the Storybook's own files: anything else makes their
// screenshots depend on another server.
export const blockExternalRequests = async (page) => {
  // The test runner reuses a page for all stories in a file.
  if (!externalRequests.has(page)) {
    const storybookOrigin = new URL(process.env.TARGET_URL).origin;
    await page.route(
      (url) => url.origin !== storybookOrigin,
      (route) => {
        externalRequests.get(page)?.push(route.request().url());
        return route.abort();
      },
    );
    // Registered later, so they handle their requests first.
    for (const allowedRequest of allowedRequests) {
      await page.route(allowedRequest, (route) => route.continue());
    }
  }
  externalRequests.set(page, []);
};

export const assertNoExternalRequests = (page) => {
  const urls = [...new Set(externalRequests.get(page))];
  if (urls.length > 0) {
    throw new Error(
      `The story loads files from outside the Storybook:\n${urls.join("\n")}\n` +
        "Serve them from public/, or list them with a reason in .storybook/external-requests.js.",
    );
  }
};
