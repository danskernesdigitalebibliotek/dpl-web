import { md5 } from "js-md5"

import { getServerEnv } from "../config/env"

export const getPublizonServiceParameters = () => {
  return {
    clientid: getServerEnv("UNLILOGIN_PUBHUB_CLIENT_ID") ?? "",
    retailerid: getServerEnv("UNLILOGIN_PUBHUB_RETAILER_ID") ?? "",
    // The  Publizon services expect the retailerkeycode to be an MD5 hash
    // of the actual key code.
    retailerkeycode: md5(getServerEnv("UNLILOGIN_PUBHUB_RETAILER_KEY_CODE") ?? ""),
  }
}
