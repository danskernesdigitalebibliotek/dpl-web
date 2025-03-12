import { md5 } from "js-md5"

export const getPublizonServiceParameters = () => {
  return {
    clientid: process.env.UNLILOGIN_PUBHUB_CLIENT_ID ?? "",
    retailerid: process.env.UNLILOGIN_PUBHUB_RETAILER_ID ?? "",
    // The  Publizon services expect the retailerkeycode to be an MD5 hash
    // of the actual key code.
    retailerkeycode: md5(process.env.UNLILOGIN_PUBHUB_RETAILER_KEY_CODE ?? ""),
  }
}
