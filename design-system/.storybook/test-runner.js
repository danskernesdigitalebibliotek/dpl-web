const { toMatchImageSnapshot } = require("jest-image-snapshot");

const viewports = [
  { name: "mobile", width: 400, height: 900 },
  { name: "desktop", width: 1200, height: 900 },
];

module.exports = {
  setup() {
    expect.extend({ toMatchImageSnapshot });
  },
  async postVisit(page, context) {
    // Disable hyphenation to avoid platform-dependent line breaks.
    await page.addStyleTag({ content: "* { hyphens: none !important; }" });

    for (const { name, width, height } of viewports) {
      await page.setViewportSize({ width, height });
      // Wait for layout to settle after resize.
      await page.waitForTimeout(200);

      const image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        customSnapshotsDir: `${process.cwd()}/__visual_snapshots__`,
        customSnapshotIdentifier: `${context.id}--${name}`,
        failureThreshold: 0.4,
        failureThresholdType: "percent",
        allowSizeMismatch: true,
      });
    }
  },
};
