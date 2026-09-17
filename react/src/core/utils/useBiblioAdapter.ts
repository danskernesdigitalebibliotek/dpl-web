import useConfigFlag from "./useConfigFlag";

// Whether digital materials go through the Biblio adapter (the service
// layer) rather than straight to Publizon, which remains the default.
// Named after the flag the CMS ships it as: data-use-biblio-adapter-config.
const useBiblioAdapter = (): boolean => useConfigFlag("useBiblioAdapterConfig");

export default useBiblioAdapter;
