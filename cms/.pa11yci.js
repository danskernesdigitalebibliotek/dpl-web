module.exports = {
  defaults: {
    chromeLaunchConfig: {
      executablePath: "/usr/bin/chromium-browser",
      args: [
        "--no-sandbox"
      ]
    },
    runners: ["axe"],
    timeout: 600000
  },
  urls: [
    {
      url: "http://varnish:8080/",
      screenCapture: "/app/pa11y/screenshots/front-page.png"
    },
    {
      url: "http://varnish:8080/search?q=harry+potter&x=0&y=0",
      screenCapture: "/app/pa11y/screenshots/search-page.png"
    }
    // TODO: The material page currently fails accessibility checks:
    // 1. Requests to Publizon are missing from Wiremock.
    // 2. Error handling triggers the error boundary alert
    // 3. The error boundary alert is not accessible due to missing H1
    //
    // Renable the test once these issues are resolved.
    /*{
      url: "http://varnish:8080/work/work-of:870970-basis:25245784?type=bog",
      screenCapture: "/app/pa11y/screenshots/work-page.png"
    }*/
  ]
}
