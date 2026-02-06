import { TUserInfo } from "@/app/(routes)/pubhub/(lib)/types"
import { TCreateLoan } from "@/app/(routes)/pubhub/v1/user/loans/[identifier]/(lib)/types"
import { getEnv, getServerEnv } from "@/lib/config/env"
import { getPublizonServiceParameters } from "@/lib/helpers/publizon"
import { createClientAsync as createClientAsyncCreateLoan } from "@/lib/soap/publizon/v2_7/generated/createloan"

// Set client to mocked endpoint in test mode
const clientEndpoint = getEnv("TEST_MODE")
  ? `${getServerEnv("UNILOGIN_WELLKNOWN_URL")}/createloan`
  : undefined

export const createLoanRequest = async (uniLoginUserInfo: TUserInfo, ebookId: string) => {
  const client = await createClientAsyncCreateLoan(
    "./lib/soap/publizon/v2_7/wsdl/createloan.wsdl",
    {
      endpoint: clientEndpoint,
    }
  )

  const { clientid, retailerid, retailerkeycode } = await getPublizonServiceParameters()
  const institutionid = uniLoginUserInfo.institutionIds[0]
  if (!institutionid) {
    throw new Error("Institution id not found")
  }
  const [response] = await client.CreateLoanAsync({
    retailerid,
    retailerkeycode,
    ebookid: ebookId,
    cardnumber: uniLoginUserInfo.uniid,
    clientid,
    institutionid: institutionid,
  })

  return response.CreateLoanResult as TCreateLoan
}
