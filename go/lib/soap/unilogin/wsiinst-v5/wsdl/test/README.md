# Unilogin WSDL — Test Mode

## Background

During CI / Cypress test runs the container has no outbound access to
remote URLs in STIL. This will result in breaking the Unilogin auth callback flow under test.

## What this directory contains

A self-contained copy of the WSDL and all referenced XSD schemas with **all
remote `schemaLocation` references replaced by local relative paths**:

| File                       | Description                                                    |
| -------------------------- | -------------------------------------------------------------- |
| `ws.test.wsdl`             | Copy of the production WSDL; XSD imports point to local files  |
| `wsiinst-ws.xsd`           | Root XSD for the `wsiinst` namespace (element declarations)    |
| `wsiinst-schema.xsd`       | Complex type definitions for the `wsiinst` namespace           |
| `common/ws-common.xsd`     | Common WS element declarations shared across namespaces        |
| `common/schema-common.xsd` | Common type definitions (credentials, institutions, groups, …) |

### Remote → local URL mapping

The following remote `schemaLocation` values in `ws.wsdl` are replaced in `ws.test.wsdl`:

| Remote URL (production)                                              | Local path (test)      |
| -------------------------------------------------------------------- | ---------------------- |
| `https://wsiinst.unilogin.dk/wsiinst-v5/ws?xsd=common/ws-common.xsd` | `common/ws-common.xsd` |
| `https://wsiinst.unilogin.dk/wsiinst-v5/ws?xsd=wsiinst-ws.xsd`       | `wsiinst-ws.xsd`       |

The remaining imports inside the vendored XSD files use relative local paths throughout.

## How it is used

In `go/app/(routes)/auth/callback/unilogin/requests.ts` the WSDL path is
switched based on the `TEST_MODE` environment variable:

```ts
const isTestMode = getEnv("TEST_MODE")
const wsdlPath = isTestMode
  ? "./lib/soap/unilogin/wsiinst-v5/wsdl/test/ws.test.wsdl"
  : "./lib/soap/unilogin/wsiinst-v5/wsdl/ws.wsdl"
```

When `TEST_MODE` is truthy the local vendored WSDL is used, avoiding any
network requests during client creation. The SOAP endpoint itself is still
pointed at the mock server (`UNILOGIN_WELLKNOWN_URL/institution`) that the
Cypress test environment spins up.

## Keeping these files in sync

These files were copied from the live Unilogin service WSDL. If the
upstream service updates its schema, you should:

1. Download the new `ws.wsdl` and accompanying XSDs from Unilogin.
2. Replace the remote `schemaLocation` URLs with the equivalent relative paths
   used in this directory.
3. Re-run codegen type generator to update the generated client.
