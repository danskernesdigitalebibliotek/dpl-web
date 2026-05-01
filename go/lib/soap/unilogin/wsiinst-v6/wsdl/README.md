# wsiINST v6 WSDL

## Overview

The WSDL and XSD schemas are vendored locally so that `createClientAsync`
never makes remote HTTP requests during WSDL parsing. This is required
because CI has no outbound access to STIL, and avoids latency in production.

The same WSDL is used in all environments. The endpoint is set explicitly
in `requests.ts` at runtime (mock server in test, production in prod).

## File structure

| File                | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `ws.wsdl`           | WSDL with local schema references (codegen and runtime) |
| `wsiinst-ws.xsd`    | Type definitions for the `wsiinst/6` namespace          |
| `common/common.xsd` | Common type definitions (auth errors, shared types)     |

## How vendored files differ from upstream

All remote `schemaLocation` URLs are replaced with local relative paths:

| Upstream remote URL                                                            | Local path          | File to edit                |
| ------------------------------------------------------------------------------ | ------------------- | --------------------------- |
| `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd` | `common/common.xsd` | `ws.wsdl`, `wsiinst-ws.xsd` |
| `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd`             | `wsiinst-ws.xsd`    | `ws.wsdl`                   |

## Keeping these files in sync

If STIL updates the wsiINST v6 schema:

1. Download the new WSDL and XSDs:

```
curl -o ws.wsdl 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?wsdl'
curl -o wsiinst-ws.xsd 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd'
curl -o common/common.xsd 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd'
```

2. Replace all remote `schemaLocation` URLs with local paths (see table above)
3. Run `npm run codegen:unilogin` to regenerate the TypeScript client
