# Error boundaries

## Context

We wanted to implement error boundaries in our GO application to achieve the graceful error handling, component isolation, debugging and logging, improved user experience.

## Decision

We decided to implement an error boundary wrapper specifically for paragraphs, named `ParagraphErrorBoundary`. This ensures that if a paragraph encounters an error, the issue is contained within that specific section of the site, preventing it from affecting the rest of the application.

The implementation of error boundaries will be an ongoing process. We will integrate them progressively, adding them to components where they provide the most benefit as we continue to develop and enhance the site.

## Alternatives considered

none

## Consequences

### Graceful Error Handling

Error boundaries allows us to catch JavaScript errors anywhere in the component tree, log those errors, and display a fallback UI instead of crashing the entire application. This ensures a better user experience by preventing the app from breaking completely.

### Component Isolation

By wrapping specific components with error boundaries, we can isolate errors to those components. This means that an error in one part of the UI won't affect other parts, allowing the rest of the application to continue functioning normally.

### Debugging and Logging

Error boundaries provide a way to log errors for debugging purposes. We can at some point use them to send error reports to a logging service, which helps in monitoring and fixing issues more efficiently.

### Fallback UI

When an error is caught by an error boundary, we can display a fallback UI. This could be a simple error message, a "Something went wrong" page, or any custom UI that informs the user about the issue without exposing technical details.

### Improved User Experience

By handling errors gracefully and providing meaningful feedback to users, error boundaries contribute to a smoother and more reliable user experience. Users are less likely to encounter a completely broken application.
