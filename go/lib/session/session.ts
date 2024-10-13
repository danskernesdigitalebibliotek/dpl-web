import { getIronSession, IronSession, SessionOptions } from "iron-session";
import { TSessionType } from "../types/session";
import { cookies } from "next/headers";

export const sessionOptions: SessionOptions = {
  // TODO: generate a random password and store it in a secure place
  password: process.env.SESSION_SECRET!,
  cookieName: "go-session",
  cookieOptions: {
    // secure only works in `https` environments
    // if your localhost is not on `https`, then use: `secure: process.env.NODE_ENV === "production"`
    secure: process.env.NODE_ENV === "production"
  },
  // TODO: Decide on the session ttl.
  ttl: 60 * 60 * 24 * 7 // 1 week
};

export interface TSessionData {
  isLoggedIn: boolean;
  access_token?: string;
  refresh_token?: string;
  id_token?: string;
  expire?: Date;
  code_verifier?: string;
  userInfo?: {
    sub: string;
    uniid: string;
    institutionIds: string;
  };
  type: TSessionType;
}

export const defaultSession: TSessionData = {
  isLoggedIn: false,
  access_token: undefined,
  refresh_token: undefined,
  id_token: undefined,
  expire: undefined,
  code_verifier: undefined,
  userInfo: undefined,
  type: "anonymous"
};

export async function getSession(): Promise<IronSession<TSessionData>> {
  const session = await getIronSession<TSessionData>(cookies(), sessionOptions);
  if (!session.isLoggedIn) {
    session.isLoggedIn = false;
    session.access_token = defaultSession.access_token;
    session.refresh_token = defaultSession.refresh_token;
    session.id_token = defaultSession.id_token;
    session.expire = defaultSession.expire;
    session.userInfo = defaultSession.userInfo;
    session.type = defaultSession.type;
  }

  return session;
}
