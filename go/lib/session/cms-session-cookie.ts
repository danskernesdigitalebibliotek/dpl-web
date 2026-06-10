// Read-only helper for the Drupal CMS session cookie (SSESS*).
//
// Lives in its own module — not in `session.ts` — because the Redis client
// (imported by `session.ts`) is Node-only and must stay out of any module
// reachable from a client component. `lib/helpers/user.ts` calls
// `userIsLoggedInAtDplCms()` from a path that ends up in the client bundle.
export const getDplCmsSessionCookie = async () => {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  const sessionCookie = allCookies.find(cookie => cookie.name.startsWith("SSESS"))
  return sessionCookie ?? null
}
