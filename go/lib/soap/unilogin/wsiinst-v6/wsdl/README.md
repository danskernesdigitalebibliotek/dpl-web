# wsiINST v6 WSDL

## Overview

The WSDL and XSD schemas are vendored locally so that `createClientAsync`
never makes remote HTTP requests during WSDL parsing. This is required
because CI has no outbound access to STIL, and avoids latency in production.

The endpoint is set explicitly in `requests.ts` at runtime.

## File structure

| File                | Description                                                          |
| ------------------- | -------------------------------------------------------------------- |
| `ws.wsdl`           | WSDL with local schema references — used by both codegen and runtime |
| `wsiinst-ws.xsd`    | Type definitions for the `wsiinst/6` namespace                       |
| `common/common.xsd` | Common type definitions (auth errors, shared types)                  |
| `test/`             | Test-specific files for Cypress mock server (see test/README.md)     |

## How `ws.wsdl` differs from the upstream WSDL

The upstream WSDL at `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?wsdl` has:

1. **Remote schema imports** — replaced with local relative paths:

   | Upstream remote URL                                                            | Local path          |
   | ------------------------------------------------------------------------------ | ------------------- |
   | `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd` | `common/common.xsd` |
   | `https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd`             | `wsiinst-ws.xsd`    |

2. **WS-Policy references** — removed (WS-Security signing is configured in code, not via WSDL policy)

3. **Common WSDL import** — removed (`common.wsdl` only contained policy definitions)

## Keeping these files in sync

If STIL updates the wsiINST v6 schema:

1. Download the new WSDL and XSDs:

```
  curl -o ws.wsdl 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?wsdl'
  curl -o wsiinst-ws.xsd 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=wsiinst-ws.xsd'
  curl -o common/common.xsd 'https://brugerdatabasen.stil.dk/bpi/wsiinst/6?xsd=../../common/v3/common.xsd'
```

2. In `ws.wsdl`: replace remote `schemaLocation` URLs with local paths (see table above)
3. In `ws.wsdl`: remove the `<import location="...common.wsdl">` and all `<wsp:PolicyReference>` elements
4. Run `npm run codegen:unilogin` to regenerate the TypeScript client
5. Update the test copy in `test/` if needed
