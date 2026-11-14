import { getActiveToken, getConnectionSettings } from "../connection/connectionSettings"
import type { TypedDocumentString } from "./generated/graphql"

type GraphqlResponse<TResult> = {
  data?: TResult
  errors?: { message: string }[]
}

/** Posts a generated FBI operation and returns its typed data, throwing on GraphQL errors. */
export const fetchFbi = async <TResult, TVariables>(
  document: TypedDocumentString<TResult, TVariables>,
  variables: TVariables
): Promise<TResult> => {
  const settings = getConnectionSettings()
  const response = await fetch(settings.fbiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getActiveToken(settings)}`,
    },
    body: JSON.stringify({ query: document.toString(), variables }),
  })

  if (!response.ok) {
    throw new Error(`FBI responded ${response.status} ${response.statusText}`)
  }

  const { data, errors } = (await response.json()) as GraphqlResponse<TResult>
  if (errors?.length) {
    throw new Error(errors[0].message)
  }
  if (!data) {
    throw new Error("FBI returned no data")
  }
  return data
}
