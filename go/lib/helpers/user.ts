import { IronSession } from "iron-session"

import { TSessionData } from "../session/session"

export const userIsAnonymous = (session: IronSession<TSessionData> | TSessionData | null) =>
  !session || !session.isLoggedIn || session.type === "anonymous"
