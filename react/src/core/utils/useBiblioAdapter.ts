import { useConfig } from "./config";

// Whether digital materials go through the Biblio adapter (the service
// layer) rather than straight to Publizon, which remains the default.
// Named after the flag the CMS ships it as: data-use-biblio-adapter-config.
const useBiblioAdapter = (): boolean => {
  const config = useConfig();

  try {
    return config("useBiblioAdapterConfig") === "1";
  } catch {
    // An older CMS release ships no such config; keep using Publizon.
    return false;
  }
};

export default useBiblioAdapter;
