import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getUniloginClient } from "@/lib/session/oauth/uniloginClient";
import { getSession, setTokensOnSession } from "@/lib/session/session";
import { TTokenSet } from "@/lib/types/session";

const sessionTokenSchema = z.object({
  isLoggedIn: z.boolean(),
  access_token: z.string(),
  refresh_token: z.string()
});

export async function GET(request: NextRequest, response: NextResponse) {
  const session = await getSession();
  const frontpage = `${process.env.NEXT_PUBLIC_APP_URL!}/`;

  // If the user is not logged in, we redirect to the frontpage.
  if (!session.isLoggedIn) {
    return NextResponse.redirect(frontpage, { headers: response.headers });
  }
  const redirect = request.nextUrl.searchParams.get("redirect");
  // We need the redirect URL to be present in the query string.
  if (!redirect) {
    return NextResponse.redirect(frontpage, { headers: response.headers });
  }

  try {
    const tokens = sessionTokenSchema.parse(session);
    const client = await getUniloginClient();
    const newTokens = await (client.refresh(
      tokens.refresh_token
    ) as Promise<TTokenSet>);
    setTokensOnSession(session, newTokens);
    await session.save();
    console.log("Tokens refreshed successfully:", newTokens);
  } catch (error) {
    // TODO: maybe distinguish between ZodError and other errors?
    // TODO: Should we redirect to an end-of-session page?
    // Session is corrupt so we need to destroy it.
    session.destroy();

    const isZodError = error instanceof z.ZodError;
    console.error(isZodError ? JSON.stringify(error.errors) : error);
  } finally {
    return NextResponse.redirect(redirect, { headers: response.headers });
  }
}

export const dynamic = "force-dynamic";
