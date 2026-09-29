"use server"

import { z } from "zod"

import AccessForbiddenError from "../graphql/fetchers/AccessForbiddenError"
import UnauthenticatedError from "../graphql/fetchers/UnauthenticatedError"
import { useGetAdgangsplatformenUserTokenQuery } from "../graphql/generated/dpl-cms/graphql"
import { getDplCmsSessionCookie } from "../session/session"

export type TUserTokenResult =
  // The CMS handed out a token the session can use.
  | { status: "token"; data: { token: string; expire: { timestamp: number } } }
  // The CMS answered, and this browser has no usable token: the Drupal
  // session is gone, or this is a CMS user who is not a patron.
  | { status: "no-token" }
  // The CMS could not be reached or answered something we cannot read. This
  // says nothing about the session, so callers must leave it alone.
  | { status: "error" }

// The CMS decides whether a usable token exists. It cannot renew one, and
// Drupal logs out patrons whose token has expired, so the answer for a dead
// session is a refused request rather than a token. Either way "no-token"
// means the session is over — see ADR-012.
export const loadUserToken = async (): Promise<TUserTokenResult> => {
  const sessionCookie = await getDplCmsSessionCookie()
  if (!sessionCookie) {
    return { status: "no-token" }
  }

  try {
    const data = await useGetAdgangsplatformenUserTokenQuery.fetcher(undefined, {
      headers: {
        Cookie: `${sessionCookie.name}=${sessionCookie.value}`,
      },
    })()

    const user = data?.dplTokens?.adgangsplatformen?.user
    if (!user) {
      return { status: "no-token" }
    }

    const validateUserToken = z
      .object({
        token: z.string(),
        expire: z.object({
          timestamp: z.number(),
        }),
      })
      .safeParse(user)

    if (validateUserToken.error) {
      console.error("loadUserToken error", validateUserToken.error.flatten())
      return { status: "error" }
    }

    return { status: "token", data: validateUserToken.data }
  } catch (error) {
    // The CMS refused the session cookie (401/403). Drupal logs out patrons
    // whose token has expired, so the cookie no longer represents a logged-in
    // user — that is an answer, not a failure.
    if (error instanceof UnauthenticatedError || error instanceof AccessForbiddenError) {
      return { status: "no-token" }
    }

    console.error("Could not load user token.")
    return { status: "error" }
  }
}
