import getQueryClient from "../getQueryClient"
import { getGetPatronInformationByPatronIdV2QueryOptions } from "../rest/fbs/generated/fbs"
import { AuthenticatedPatronV6 } from "../rest/fbs/generated/model"
import { fetcher } from "../rest/fbs/mutator/fetcher"

export const loadPatronServerSide = async (accessToken: string) => {
  const queryClient = getQueryClient()
  const { queryKey } = getGetPatronInformationByPatronIdV2QueryOptions()
  const patronInfoUrl = queryKey[0] as string

  const response = await queryClient.fetchQuery({
    queryKey,
    queryFn: ({ signal }) =>
      fetcher<AuthenticatedPatronV6>({
        url: patronInfoUrl,
        method: "GET",
        signal,
        headers: {
          authorization: `Bearer ${accessToken}`,
        },
      }),
  })

  return response
}
