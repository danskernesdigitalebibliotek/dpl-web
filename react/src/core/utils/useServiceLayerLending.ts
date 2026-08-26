import { useConfig } from "./config";

// Whether digital lending goes through the service layer rather than
// straight to Publizon, which remains the default.
//
// The config key still names the adapter behind the service layer: it is the
// CMS' data attribute (data-use-biblio-adapter-config), not ours to rename
// from here.
const useServiceLayerLending = (): boolean => {
  const config = useConfig();

  try {
    return config("useBiblioAdapterConfig") === "1";
  } catch {
    // An older CMS release ships no such config; keep using Publizon.
    return false;
  }
};

export default useServiceLayerLending;
