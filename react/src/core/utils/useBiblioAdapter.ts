import { useConfig } from "./config";

// Set in the CMS, shipped to every app as data-use-biblio-adapter-config.
// Publizon remains the default.
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
