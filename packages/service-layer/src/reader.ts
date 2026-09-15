import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { ReaderSignInToken, ServiceLayerConfig } from "./types"

/**
 * A custom token the WeDoBooks SDK signs in with. The reader and player keep
 * their own session against WeDoBooks, so the adapter vouches for the patron
 * we authenticated and hands back a token the SDK accepts. Short-lived
 * (`expiresInSeconds`): mint a new one rather than hold on to it.
 */
export async function getReaderSignInToken(config: ServiceLayerConfig): Promise<ReaderSignInToken> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.createSignInToken()
}
