import fetchToCurl from "fetch-to-curl"

/**
 * Debug utility for logging fetch requests as cURL commands during development.
 *
 * This function is designed for server-side debugging of fetch requests in development
 * environments. It converts fetch requests to equivalent cURL commands and logs them
 * to the console, making it easier to inspect and reproduce HTTP requests during
 * development and testing.
 *
 * @param url - The URL for the fetch request
 * @param options - The RequestInit options for the fetch request (headers, method, body, etc.)
 * @param label - Optional label to identify the fetch request in logs
 *
 * @example
 * ```typescript
 * // Debug a simple GET request
 * debugFetch('https://api.example.com/users', {}, 'Get Users');
 *
 * // Debug a POST request with headers and body
 * debugFetch('https://api.example.com/users', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ name: 'John' })
 * }, 'Create User');
 * ```
 */
export const debugFetch = (url: string, options: RequestInit, label?: string) => {
  // eslint-disable-next-line no-console
  console.log(`[Fetch Debug${label ? ` | ${label}` : ""}]`, fetchToCurl(url, options))
}
