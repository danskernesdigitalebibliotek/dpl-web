# Open questions and untested scenarios

A running list for the work-page PoC. Tick items off or delete them when they
are settled; add new ones as they come up.

## Untested scenarios

### Needs a user token

- [ ] "Læs artikel" opens the Retriever article in the dialog
      (`/work/work-of:870971-tsart:136293443`).
- [ ] A patron outside the municipality doesn't get "Læs artikel" at all
      (`usePatron().isResident = false`).
- [ ] A blocked patron gets a "Spærret" button and the blocked text.
- [ ] The simulated order dialog shows the patron's email, "Godkend
      bestilling" ends on the "kun vist i prototypen" receipt, and "Skift
      udgave" goes to the picker and back
      (`/work/work-of:870971-tsart:85962698`).

### Data and environments

- [ ] The article examples on the `next` profile with the customer's token.
      With our test token they only resolve on `opac`.
- [ ] The article concept on the Lagoon environment (PR #2324).
- [ ] An article or review with no access at all, which shows "Kontakt
      biblioteket" (several Harry Potter reviews have no access).
- [ ] The README's article examples show the switch modes it lists (chips
      only, "Skift udgave", "Skift bestillingsmulighed"). Written from what we
      knew of their data, not yet checked on the reworked page.
- [ ] An edition with three or more working ways in the picker.
- [ ] A non-resident patron whose newest edition only has Retriever: the
      default ignores residency, so the page lands on "Kontakt biblioteket"
      while an older edition might have a way.
- [ ] A work mixing articles with other material types: the category in charge
      comes from FBI's best representation.

### Layout and accessibility

- [ ] The mobile layout at 375px; it was only checked at 500px.
- [ ] The picker by keyboard and screen reader: one radio group across the
      cards, the "Se detaljer" toggles, Escape and focus return, and the
      order dialog → picker → order round trip.
- [ ] The material type chips by keyboard.

## Open questions

### For the designer

- [ ] **Varde's near-identical cards.** Cards now show the host publication and
      source, as the prototype's do. When two posts share the host
      publication, only the source tells them apart. Is that enough?
- [ ] **Undrawn states.** No boards exist for reading in Retriever, the
      anonymous "log ind" state, a blocked patron, no access at all or a dead
      link. The PoC improvises them.
- [ ] **"Kontakt biblioteket".** Where should it lead? It is a placeholder, and
      the prototype has no state without a way.
- [ ] **Placeholder texts.** The texts under the button and in the order
      dialog are the prototype's placeholders, to be agreed later.
- [ ] **"Udgave: 1998, digitaliseret".** FBI has nothing that says an edition
      is a digitised print; the PoC shows the year only.
- [ ] **Covers.** FBI gives articles its red placeholder cover, which the PoC
      shows. Keep it, or use the prototype's coloured title block?
- [ ] **Site chrome.** The desktop boards show the library's full header; the
      PoC shows none.
- [ ] **Several links of the same kind.** The PoC keeps the first working
      `AccessUrl` and skips the rest. Kolding 2018
      (`/work/work-of:870971-tsart:73451485`) has two, tidsskrift.dk and
      doi.org, which lead to the same article; only tidsskrift.dk becomes "Se
      online". Options: a button per link, named by its origin ("Se online på
      tidsskrift.dk"), or one "Se online" with the other links listed in the
      details.

### For the developers and DDF

- [ ] **Which FBI profile and agency** will the customer test with?
- [ ] **Varde's data differs from the artifact.** FBI already groups both posts
      in one work, and both only offer interlibrary loan; neither has Digital
      Article Service, which the artifact assumes for the Bibliotekskatalog post.
- [ ] **Ordering via the host publication** (DDFNEXT-797, on hold). Until then
      "Find det trykte nummer" searches the PoC for the periodical's title.
- [ ] **What gives "Find det trykte nummer", and where does it lead?** The PoC
      shows it for FBI's `InterLibraryLoan` access, but that entry means the
      manifestation can be borrowed through interlibrary loan, not that the
      printed issue can be found. Options:
      - Link to the periodical's work page when a lookup finds it, falling back
        to search.
      - Offer an interlibrary loan order for the article itself (simulated).
      - Keep the search placeholder until DDFNEXT-797 is decided.
      - Do as today: react/ ignores `InterLibraryLoan` for articles, so an
        article with only that (like Varde) gets no buttons and shows
        `MaterialUnavailableNotice` ("not available through the website",
        linking to the library's `materialUnavailableUrl`, typically
        Bibliotek.dk, where interlibrary loans can be ordered). In the PoC
        that would be the artifact's "Kontakt biblioteket" fallback.
- [ ] **Host publications can't be found reliably in FBI.** `hostPublication`
      has title, ISSN, issue and year, but no work id or pid. `term.issn=…`
      finds the articles in the periodical (840 for Slagmark, 0108-8084), not
      the periodical itself. A title search found Varde's yearbook
      (`work-of:150096-slaegt:961722`) but not Slagmark. Is there a reliable
      way from an article to its periodical, and to the specific issue?
- [ ] **"Tidsskrift online"**, the ticket's last access way, has no source in
      FBI that we have found.
- [ ] **Residency and digital copies.** Retriever only serves residents. Does
      the same rule apply to "Bestil digital kopi"?
- [ ] **Manifestations with several specific types.** Some carry e.g. both
      "artikel" and "artikel (online)". The PoC files them under their first
      type for the chips and the picker. How common is it, and is the first
      type the right one?
- [ ] **Chips across categories.** The chips only list the article category's
      types. A work that also has a book would need chips that switch to
      another category's page, closer to "Format først".

### Answered by the second prototype and Tomas

- One button: the other ways are chosen in the picker, behind "Skift …".
- Edition cards show the article title, host publication, type and source.
- Desktop has its own boards ("Fiktiv artikel · Desktop").
- The default edition is the newest with a working way (the prototype's own
  code ranks the other way round when a type is chosen; Tomas settled it).
- "Udgaver (n)" lists every manifestation of the work, across types: librarians
  use it as an overview.
- Retriever is hidden from non-residents. FBS knows residency up front
  (`resident` on its patron), exposed as `usePatron().isResident`.

### Answered by real data

- Dead online links can be recognised: `AccessUrl.status` is `OK`, `BROKEN`,
  `GONE` or `INVALID` (Helsingør's link is `GONE`).
- Articles and reviews share FBI's general material type `ARTICLES`.
- Retriever requires a logged-in patron (`BORROWER_NOT_LOGGED_IN` otherwise).
