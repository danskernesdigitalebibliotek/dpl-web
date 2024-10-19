import { z } from "zod";

export default {
  tokenSet: z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    id_token: z.string(),
    expires_in: z.number(),
    refresh_expires_in: z.number()
  }),
  introspect: z.object({
    uniid: z.string(),
    institutionIds: z.string()
  }),
  userInfo: z.object({
    sub: z.string()
  })
};
