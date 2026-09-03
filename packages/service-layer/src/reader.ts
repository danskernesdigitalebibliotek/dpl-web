import { createBiblioClient } from "../biblio/src"
import { resolveBiblioConfig } from "./internal/resolveBiblioConfig"
import type { ReaderSignInToken, ServiceLayerConfig } from "./types"

/**
 * A custom token the WeDoBooks SDK signs in with.
 *
 * The reader and player run inside the SDK, which keeps its own session
 * against WeDoBooks rather than going through the adapter. This is the bridge:
 * the adapter vouches for the patron we already authenticated and hands back a
 * token the SDK accepts.
 *
 * Short-lived by design - `expiresInSeconds` says how long - so callers must
 * mint a new one rather than hold on to it.
 */
export async function getReaderSignInToken(config: ServiceLayerConfig): Promise<ReaderSignInToken> {
  const biblio = createBiblioClient(resolveBiblioConfig(config))
  return biblio.createSignInToken()
}
