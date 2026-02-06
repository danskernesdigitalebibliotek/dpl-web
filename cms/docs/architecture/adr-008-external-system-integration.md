# Architecture Decision Record: Integration with external systems

## Context

DPL CMS is only intended to integrate with one external system:
Adgangsplatformen. This integration is necessary to obtain patron and library
tokens needed for authentication with other business systems. All these
integrations should occur in the browser through [React components](https://github.com/danskernesdigitalebibliotek/dpl-react).

The purpose of this is to avoid having data passing through the CMS as an
intermediary. This way the CMS avoids storing or transmitting sensitive data.
It may also improve performance.

In some situations it may be beneficiary to let the CMS access external systems
to provide a better experience for business users e.g. by displaying options
with understandable names instead of technical ids or validating data before it
reaches end users.

## Decision

We choose to allow CMS to access external systems server-side using PHP.
This must be done on behalf of the library - never the patron.

## Alternatives considered

- Implementing React components to provide administrative controls in the CMS.
  This would increase the complexity of implementing such controls and cause
  implementors to not consider improvements to the business user experience.

## Consequences

- We allow PHP client code generation for external services. These should not
  only include APIs to be used with library tokens. This signals what APIs are
  OK to be accessed server-side.
- The CMS must only access services using the library token provided by the
  [`dpl_library_token.handler` service](../../web/modules/custom/dpl_library_token/dpl_library_token.services.yml).
