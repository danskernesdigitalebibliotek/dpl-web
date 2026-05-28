/**
 * Simple function to determine if we’re running server-side or not.
 */
export function isServer() {
  return typeof window === "undefined"
}

/**
 * Check if we’re running inside a test.
 */
export function isTest() {
  return process.env.NODE_ENV === "test" || process.env.TEST_MODE
}
