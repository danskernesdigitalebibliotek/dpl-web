# Architecture Decision Record: JavaScript logging

## Context

In the DPL CMS, we integrate React applications within a Drupal system as outlined in [a previous ADR](adr-003-ddb-react-integration.md). Effective JavaScript error logging is crucial for timely detection, diagnosis, and resolution of issues. It's essential that our logging setup not only captures client-side errors efficiently but also integrates seamlessly with Drupal's Watchdog logging system. This allows for logs to be forwarded to Grafana for real-time monitoring and analysis, enhancing our system's reliability and performance monitoring capabilities.

## Decision

After evaluating several options, we decided to integrate [JSNLog](https://jsnlog.com) via the [JSNLog Drupal module](https://www.drupal.org/project/jsnlog) for logging JavaScript errors. This integration allows us to capture and log client-side errors directly from our React components into our server-side logging infrastructure.

## Alternatives considered

* **[JSLog Drupal module](https://www.drupal.org/project/jslog):**

  * The module does not have a stable release at the time of writing, which poses risks regarding reliability and ongoing support.
  * During testing, it generated excessively large numbers of log entries, which could overwhelm our logging infrastructure and complicate error analysis.

* **Custom built solution:**

  * Significant development time and resources required to build, test, and maintain the module.
  * Lacks the community support and proven stability found in established third-party solutions, potentially introducing risks in terms of long-term reliability and scalability.

* **Third-party services:**
  * We deliberately dismissed options such as Sentry, Raygun, and similar third-party services due to our reluctance to introduce additional external dependencies and complexities.

## Consequences

1. **Enhanced Error Detection and Diagnostics:**
    * **Pros:** Improved visibility into client-side errors helps in faster detection and resolution of issues that impact user experience.
    * **Cons:** The detailed error logging could potentially lead to larger volumes of data to manage and analyze, which may require additional resources.
2. **Seamless Integration with Existing Systems:**
    * **Pros:** By utilizing a Drupal module that connects JSNLog with Watchdog, errors logged on the client side are automatically integrated into the existing Drupal logging framework. This ensures that all system logs are centralized, simplifying management and analysis.
    * **Cons:** Dependency on the Drupal module for JSNLog could introduce complexities, especially if the module is not regularly updated or falls out of sync with new versions of JSNLog or Drupal.
    