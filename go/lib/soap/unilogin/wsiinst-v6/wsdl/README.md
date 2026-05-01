# wsiINST v6 WSDL

## Overview

The WSDL and XSD schemas are vendored locally so that `createClientAsync`
never makes remote HTTP requests during WSDL parsing. This is required
because CI has no outbound access to STIL, and avoids latency in production.

The same WSDL is used in all environments. The endpoint is set explicitly
in `requests.ts` at runtime (mock server in test, production in prod).

## File structure

| File                | Description                                            |
| ------------------- | ------------------------------------------------------ |
| `ws.wsdl`           | WSDL with local schema references (codegen and runtime)|
| `wsiinst-ws.xsd`    | Type definitions for the `wsiinst/6` namespace         |
| `common/common.xsd` | Common type definitions (auth errors, shared types)    |

## How vendored files differ from upstream

All remote `schemaLocation` and `import location` URLs are replaced with local paths.
WS-Policy references are removed (WS-Security signing is configured in code).

**`ws.wsdl`** (from `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?wsdl`):

| Change | Upstream | Local |
| ------ | -------- | ----- |
| Schema import | `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd` | `common/common.xsd` |
| Schema import | `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd` | `wsiinst-ws.xsd` |
| WSDL import | `<import location="...common.wsdl">` | Removed |
| WS-Policy | `<wsp:PolicyReference>` elements | Removed |

**`wsiinst-ws.xsd`** (from `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd`):

| Change | Upstream | Local |
| ------ | -------- | ----- |
| Schema import | `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd` | `common/common.xsd` |

**`common/common.xsd`** — no changes needed (self-contained, no imports)

## Keeping these files in sync

If STIL updates the wsiINST v6 schema:

1. Download the new WSDL and XSDs:

```
curl -o ws.wsdl 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?wsdl'
curl -o wsiinst-ws.xsd 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd'
curl -o common/common.xsd 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd'
```

2. In `ws.wsdl`: replace remote `schemaLocation` URLs with local paths, remove WSDL import and WS-Policy elements (see table above)
3. In `wsiinst-ws.xsd`: replace the remote `schemaLocation` URL with `common/common.xsd`
4. Run `npm run codegen:unilogin` to regenerate the TypeScript client
