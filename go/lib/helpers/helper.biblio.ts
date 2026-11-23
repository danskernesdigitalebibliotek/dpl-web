import type { TDplCmsPublicConfig } from "@/lib/config/dpl-cms/configSchemas"

// Whether digital materials go through the Biblio adapter (the service
// layer) rather than straight to Publizon, which remains the default.
// Only active when the whole configuration is in place — the flag alone
// cannot run the reader/player.
export const isBiblioAdapterActive = (biblio: TDplCmsPublicConfig["biblio"] | undefined) =>
  Boolean(biblio?.enabled && biblio.baseUrl && biblio.sdk)
