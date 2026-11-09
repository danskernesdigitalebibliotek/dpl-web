# Open questions and untested scenarios

A running list for the work-page PoC. Tick items off or delete them when they
are settled; add new ones as they come up.

## Untested scenarios

### Needs a user token

- [ ] "Læs artikel" opens the Retriever article in the dialog
      (`/work/work-of:870971-tsart:136293443`).
- [ ] A patron outside the municipality gets Retriever's
      `BORROWER_NOT_IN_MUNICIPALITY` message instead of the article.
- [ ] A blocked patron gets "Spærret" buttons and the blocked status line.
- [ ] The simulated "Bestil digital kopi" dialog shows the patron's email,
      and "Bestil" ends on the "kun vist i prototypen" message
      (`/work/work-of:870971-tsart:85962698`).

### Data and environments

- [ ] The article examples on the `next` profile with the customer's token.
      With our test token they only resolve on `opac`.
- [ ] The article concept on the Lagoon environment (PR #2324).
- [ ] An article or review with no access at all, which shows "Kontakt
      biblioteket" (several Harry Potter reviews have no access).
- [ ] An article with more than two working access ways: only the first two
      are shown.
- [ ] A work mixing articles with other material types: the category in charge
      comes from FBI's best representation.

### Layout and accessibility

- [ ] The mobile layout at 375px; it was only checked at 500px.
- [ ] The edition picker by keyboard and screen reader: radio focus, the
      "Se detaljer" toggles, Escape and focus return.

## Open questions

### For the designer

- [ ] **Varde's identical cards.** With "never merge", both editions are titled
      "2011 · Trykt" and differ only by source. Is that acceptable, or should
      card titles describe the access, as in the artifact's emergency solution?
- [ ] **Edition card titles.** The PoC derives "year · Online/Trykt". Should
      titles follow a richer rule, like the artifact's "1988 · Trykt – kan
      bestilles som digital kopi"?
- [ ] **Desktop layout.** Articles on desktop are adapted from the "Flere
      formater" desktop board. Is that the intended direction?
- [ ] **Undrawn flows.** No boards exist for reading in Retriever, the digital
      copy order or the anonymous "log ind" state. The PoC improvises them.
- [ ] **Covers.** Articles have no covers in FBI, so the page shows FBI's red
      placeholder. Keep it, or use the artifact's coloured title block?
- [ ] **"Kontakt biblioteket".** Where should it lead? It is a placeholder.

### For the developers and DDF

- [ ] **Which FBI profile and agency** will the customer test with?
- [ ] **Varde's data differs from the artifact.** FBI already groups both posts
      in one work, and both only offer interlibrary loan; neither has Digital
      Article Service, which the artifact assumes for the Bibliotekskatalog post.
- [ ] **Ordering via the host publication** (DDFNEXT-797, on hold). Until then
      "Find det trykte nummer" searches the PoC for the periodical's title.
- [ ] **"Tidsskrift online"**, the ticket's last access way, has no source in
      FBI that we have found.
- [ ] **Residency.** Retriever reports it as an error. Does the same rule apply
      to digital copies, and can it be known before the patron clicks?

### Answered by real data

- Dead online links can be recognised: `AccessUrl.status` is `OK`, `BROKEN`,
  `GONE` or `INVALID` (Helsingør's link is `GONE`).
- Articles and reviews share FBI's general material type `ARTICLES`.
- Retriever requires a logged-in patron (`BORROWER_NOT_LOGGED_IN` otherwise).
