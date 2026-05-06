export interface SignInWithPasswordConfig {
  baseUrl: string
  apiKey: string
  email: string
  password: string
}

export interface SignInWithPasswordResult {
  id_token: string
  expires_in_seconds: number
}

export interface CreateSignInTokenConfig {
  baseUrl: string
  apiKey: string
  bearerToken: string
  userId: string
  createIfNotExists?: boolean
  userData?: {
    type?: "library"
    organization_id?: string
    organization_third_party_id?: string
    institution_id?: string
    tags?: string[]
  }
}

export interface CreateSignInTokenResult {
  token: string
  expires_in_seconds: number
}

/**
 * Authenticate a user via the WeDoBooks REST API using email and password.
 *
 * POST /v1/auth/sign-in
 * Docs: https://biblio-stage-dk.biblio.wedobooks.io/docs#operation/SignInWithPassword
 */
export async function signInWithPassword(
  config: SignInWithPasswordConfig
): Promise<SignInWithPasswordResult> {
  const res = await fetch(`${config.baseUrl}/v1/auth/sign-in`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
    },
    body: JSON.stringify({
      email: config.email,
      password: config.password,
    }),
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `signInWithPassword failed (${res.status}): ${body || res.statusText}`
    )
  }

  return res.json()
}

/**
 * Create a custom sign-in token for a user via the WeDoBooks REST API.
 * The returned token can be passed to `service.signIn(token)`.
 *
 * POST /v1/auth/create-sign-in-token
 * Docs: https://biblio-stage-dk.biblio.wedobooks.io/docs#operation/CreateSignInToken
 */
export async function createSignInToken(
  config: CreateSignInTokenConfig
): Promise<CreateSignInTokenResult> {
  const body: Record<string, unknown> = {
    user_id: config.userId,
  }
  if (config.createIfNotExists !== undefined) {
    body.create_if_not_exists = config.createIfNotExists
  }
  if (config.userData) {
    body.user_data = config.userData
  }

  const res = await fetch(`${config.baseUrl}/v1/auth/create-sign-in-token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      Authorization: `Bearer ${config.bearerToken}`,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(
      `createSignInToken failed (${res.status}): ${text || res.statusText}`
    )
  }

  return res.json()
}
