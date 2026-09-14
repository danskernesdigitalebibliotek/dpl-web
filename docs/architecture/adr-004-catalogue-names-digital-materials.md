# The catalogue, not the lending provider, names a digital material

## Context

A digital material reaches a patron through a lending provider — Publizon
until the migration, WeDoBooks through the Biblio adapter after it. Both carry
their own bibliographic fields on a loan, and the loan list rendered those
directly, because they arrive with the loan and need no lookup.

Those fields drift from FBI, the catalogue every other surface reads. The same
e-book is lent as "FC Forza #8: Bo går i panik" and catalogued as "FC Forza -
Bo går i panik"; another is lent as "The WITCHER 5" and catalogued as "Ilddåb".
A patron saw one name on the work page and another in their loan list.

Physical loans were never affected: FBS carries no bibliographic fields, so the
apps always looked the material up in FBI by faust.

## Decision

FBI is the authority on how a digital material is described. The service layer
searches the catalogue by ISBN-13 for every digital material it returns and
takes the catalogue's title and creators, in one request per list.

It belongs here rather than in each app for the reason the package exists: a
composed function returns domain data, and which upstreams it reads from is its
own business.

A loan can be for a material the catalogue does not hold: the adapter lends
what the provider has, which is not bounded by what FBI knows. For those
materials the provider's own fields are the only description there will ever
be, so a loan keeps carrying them, and they stand wherever the catalogue offers
nothing — a material FBI has no record of, a work it credits nobody for, or an
FBI that is down, unreachable or unconfigured. Correcting a description
improves on fields the caller already has; it is never what makes the material
showable.

The authority stops at title and creators, which are what drifted and what the
apps render as the material's identity. `publisher` and `publishDate` stay the
provider's: nothing renders `publisher`, and correcting an edition's year needs
a manifestation chosen out of the work, which is a question this decision does
not answer.

The adapter lives in the service layer rather than reusing `react/`'s FBI
client, which is module-global and bound to Redux and react-query — ADR-003's
first constraint rules it out for `go/`.

## Consequences

- A loan list and a work page name the same material the same way.
  Reservations were fixed by the same change.
- Listing loans now waits on FBI as well as on the provider. Rendering the
  provider's title first would show the patron a name that then changes. The
  wait is the price of a rendered description, so a caller that needs a loan's
  id rather than its name asks for it without one — `getDigitalMaterialHolding`
  is what a material page asks, and it does not search the catalogue.
- One request per list holds for loans, which is the only list the service
  layer returns whole. A reservation list is composed row by row from
  `getDigitalMaterial`, so it searches the catalogue once per row - the cost
  rides along with the metadata request each row already makes, and batching
  it means restructuring how that list is built.
- The search is one CQL query of `term.isbn` terms, so it degrades as a
  whole: a list long enough for FBI to reject the query on its length leaves
  every material in it named by the provider, not just the ones past the
  limit. A hundred works is the page FBI allows.
- Publizon loans predating a library's migration never pass through the
  service layer, so they keep Publizon's description until remade.
- A host must resolve an `fbi` base url and auth header on
  `ServiceLayerConfig`. Both `react/` and `go/` already had FBI configured.

## Alternatives considered

- **Correct the title in each app.** Rejected: every consumer of a digital
  loan would have to know that the title it is handed is not the catalogue's.
- **Ask DBC to return the catalogue's fields from the Biblio adapter.** The
  adapter is DBC's own and DBC runs FBI, so this remains the tidier home for
  it. Not waited for: the adapter's contract is the provider's view of a
  material, and the fix was needed now.
