// Root segment of every query key in this package. Namespacing guards
// against collisions in the host app's shared QueryClient (generic names
// like "loans" exist there too), groups the package's queries in devtools,
// and lets a host invalidate all service-layer data with one prefix.
export const serviceLayerNamespace = "serviceLayer"
