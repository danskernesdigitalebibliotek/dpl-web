export const revalidate = 1

export const query = `
  query getUniLoginConfiguration {
    dplConfiguration {
      unilogin {
        unilogin_api_url
        unilogin_api_wellknown_url
        unilogin_api_client_id
        unilogin_api_client_secret
      }
    }
  }`

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS}`, {
    method: "POST",
    ...{
      headers: {
        "Content-Type": "application/json",
        Authorization: "Basic " + process.env.GRAPHQL_SCHEMA_ENDPOINT_DPL_CMS_AUTH_HEADER,
      },
    },
    body: JSON.stringify({ query }),
  })

  const json = await res.json()

  if (json.errors) {
    const { message } = json.errors[0]

    throw new Error(message)
  }

  return Response.json(json.data)
}
