import { checkA11y, injectAxe } from "axe-playwright"

module.exports = {
  async preVisit(page) {
    await injectAxe(page)
  },
  async postVisit(page) {
    await checkA11y(page, "#storybook-root", {
      axeOptions: {},
      detailedReport: true,
      detailedReportOptions: {
        html: true,
      },
      verbose: true,
    })
  },
}
