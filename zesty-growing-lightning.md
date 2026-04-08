# FBS API v0.7 vs Current REST API — Detailed Field-Level Comparison

## Context
Comparing the new FBS API v0.7 (GraphQL, `FBS_API_v.0.7-1775645760741/`) against the current REST API (`react/src/core/fbs/fbs-adapter.yaml`) to identify data gaps that would affect the React app.

---

## 1. Patron name — MISSING from new API

**Current field**: `PatronV5.name` (string, optional)
**New API equivalent**: Only `laanerKaldenavn` (nickname, max 50 chars) — NOT the same as full name

**Where the React app uses `name`:**

| File | Line | Usage |
|------|------|-------|
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 24 | Destructures `name` from patron |
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 46 | Renders `{name}` in patron profile |
| `react/src/apps/menu/menu.tsx` | 72 | `userData?.patron?.name` in menu header button |
| `react/src/apps/menu/menu-logged-in/MenuLoggedInContent.tsx` | 91 | `userData?.patron?.name` in modal header |

---

## 2. Patron address — MISSING from new API

**Current fields**: `PatronV5.address` (`AddressV2` with `street`, `postalCode`, `city`, `country`, `coName`) + `secondaryAddress`
**New API equivalent**: No address fields exist on `LaanerDetaljer` (`.gql:595-612`)

**Where the React app uses address:**

| File | Line | Field | Usage |
|------|------|-------|-------|
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 17-22 | `coName, street, postalCode, city, country` | Destructured with defaults |
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 51 | `coName` | Rendered in address block |
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 52 | `street` | Rendered in address block |
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 53 | `postalCode` | Rendered in address block |
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 54 | `city` | Rendered in address block |
| `react/src/apps/patron-page/sections/BasicDetailsSection.tsx` | 55 | `country` | Rendered in address block |

**Note**: `secondaryAddress` is defined on `PatronV5` but never accessed in any component (only in test fixtures). Not a real gap.

**`resident` field**: Used at `PatronPage.tsx:126` — `{patron?.resident && <StatusSection />}`. The new API has `laanerBorKommunen` on `PersonLaaner` which is semantically equivalent, but nested differently (under union type instead of flat on patron).

---

## 3. Patron creation — MISSING from new API

**Current endpoint**: `POST /external/agencyid/patrons/v9` → `useCreateV9()`
**New API**: No `laanerOpret` mutation exists (confirmed absent from both `.gql:1095-1104` and markdown)

**Where the React app uses it:**

| File | Line | Usage |
|------|------|-------|
| `react/src/apps/create-patron-user-info/UserInfo.tsx` | 6 | `import { useCreateV9 } from "../../core/fbs/fbs"` |
| `react/src/apps/create-patron-user-info/UserInfo.tsx` | 37 | `const { mutate } = useCreateV9()` |
| `react/src/apps/create-patron-user-info/UserInfo.tsx` | 63 | `mutate({ data: { personIdentifier, patron, pincode } })` |

**Impact**: The entire self-registration flow (`create-patron-user-info` app) cannot function.

**Guardian hooks**: `useCreateWithGuardian` and `useUpdateGuardian` are generated but **never imported or used** in any React component. Not an active gap.

---

## 4. Fee `payableByClient` — MISSING from new API

**Current field**: `FeeV2.payableByClient` (boolean, required) — `react/src/core/fbs/model/feeV2.ts:23`
**New API**: Not present on `Mellemvaerende` type (`.gql:536-545`)

**Where the React app uses it:**

| File | Line | Usage |
|------|------|-------|
| `react/src/apps/fee-list/utils/helper.ts` | 9-16 | `getFeesBasedOnPayableByClient()` — filters fees into payable vs non-payable lists |
| `react/src/apps/fee-list/utils/helper.ts` | 18-24 | `calculateFeeAmount()` — sums amounts only for payable (or non-payable) fees |
| `react/src/apps/fee-list/FeeList.tsx` | 151 | `getFeesBasedOnPayableByClient(fbsFees, true)` — renders payable fee list |
| `react/src/apps/fee-list/FeeList.tsx` | 167 | `getFeesBasedOnPayableByClient(fbsFees, false)` — renders non-payable fee list |
| `react/src/apps/fee-list/FeeList.tsx` | 72 | `calculateFeeAmount(fbsFees, true)` — total payable amount |
| `react/src/apps/fee-list/FeeList.tsx` | 75 | `calculateFeeAmount(fbsFees, false)` — total non-payable amount |

**Impact**: The fee list UI splits fees into two sections (payable online vs not). Without this field, that split is impossible.

**Other FeeV2 fields mapping to new API:**

| FeeV2 field | Used? | New API equivalent | Status |
|-------------|-------|-------------------|--------|
| `amount` | Yes (5 files) | `mellemvaerendeBeloeb` | OK |
| `creationDate` | Yes (4 files) | `mellemvaerendeDato` | OK |
| `feeId` | Yes (4 files) | `mellemvaerendeID` | OK |
| `reasonMessage` | Yes (4 files) | `mellemvaerendeNoteTilLaaner` | OK |
| `type` | No (not used in UI) | `mellemvaerendeType` (GEBYR/ERSTATNING) | OK |
| `dueDate` | No (not used in UI) | `mellemvaerendeForfaldsdato` | OK |
| `paidDate` | No (not used in UI) | `betalingDato` | **Concern**: marked required (`!`) in `.gql:538`, but should be nullable for unpaid fees |
| `payableByClient` | Yes (critical) | — | **MISSING** |
| `materials[].recordId` | Yes (4 files) | `mellemvaerendeMateriale.manifestationFAUSTNummer` | OK |
| `materials[].materialItemNumber` | Yes (4 files) | `mellemvaerendeMateriale.materialeNummer` | OK |
| `materials[].materialGroup` | Defined only | `mellemvaerendeMateriale.materialeGruppe` | OK |
| `materials[].periodical` | Defined only | `mellemvaerendeMateriale.periodika` | OK |

---

## 5. Fee query filtering — MISSING from new API

**Current**: `GET /fees/v2` takes `includepaid` and `includenonpayable` params
**New API**: `laanerMellemvaerendeHent` takes only `ISIL` + `laanerID` (`.gql:1073`)

**All 3 call sites use identical params:**

| File | Line | Params |
|------|------|--------|
| `react/src/apps/fee-list/FeeList.tsx` | 46-48 | `{ includepaid: false, includenonpayable: true }` |
| `react/src/apps/dashboard/dashboard-fees/dashboard-fees.tsx` | 14-16 | `{ includepaid: false, includenonpayable: true }` |
| `react/src/apps/menu/menu-logged-in/MenuLoggedInContent.tsx` | 39-41 | `{ includepaid: false, includenonpayable: true }` |

**Impact**: Would receive all fees including paid ones. Client-side filtering possible but less efficient.

---

## 6. Delete mutations — MISSING from `.gql` schema

**Current**: `useDeleteReservations()` → `DELETE /reservations` with array of reservation IDs
**New API**: Return types exist (`RekvisitionSlettetResultat` at `.gql:362-370`, `LaanerSletResultat` at `.gql:755-761`) but mutations are **not listed** in `type Mutation` (`.gql:1095-1104`). Operations ARE documented in the markdown (`BibliotekForespoergsler.md:791-793` for reservationSlet, `md:897-899` for bookingSlet).

**Where delete is used:**

| File | Line | Usage |
|------|------|-------|
| `react/src/apps/reservation-list/modal/delete-reservation/delete-reservation-modal.tsx` | 8 | Imports `useDeleteReservations` |
| `react/src/apps/reservation-list/modal/delete-reservation/delete-reservation-modal.tsx` | 49 | `const { mutate: deletePhysicalReservation } = useDeleteReservations()` |

**Verdict**: Likely a schema generation bug — needs to be reported.

---

## 7. Fee `betalingDato` required vs optional

**Current**: `paidDate?: string` — optional, null when unpaid (`feeV2.ts:21`)
**New API**: `betalingDato: DatoTid!` — marked required (`!`) at `.gql:538`

**Note**: `paidDate` is NOT actively used in the React UI (only in test fixtures). Low impact, but likely a schema error since unpaid fees can't have a payment date.

---

## 8. Loan `renewalStatusList` — NOT available on loan fetch in new API

**Current**: `LoanV2.renewalStatusList: string[]` — always present on every loan object
**New API**: `fornyelsesStatusListe` only exists on `FornyLaan` (renewal response, `.gql:991-996`), NOT on `Laan` (`.gql:675-679`)

**Where the React app uses it:**

| File | Line | Usage |
|------|------|-------|
| `react/src/core/utils/helpers/list-mapper.ts` | 62, 67 | Destructured from every `LoanV2` in `mapFBSLoanToLoanType()` |
| `react/src/apps/loan-list/materials/selectable-material/StatusMessage.tsx` | 20-29 | Maps through list, converts to status texts |
| `react/src/apps/loan-list/materials/stackable-material/material-status.tsx` | 86 | Passed to `StatusMessage` component |
| `react/src/components/GroupModal/GroupModalLoansList.tsx` | 79, 86 | Passed to `StatusMessage` in group modal |

**Status text mapping** (`react/src/apps/loan-list/utils/helpers.ts:30-39`):
- `"deniedMaxRenewalsReached"` → shows max renewals text
- `"deniedReserved"` → shows reserved text
- Other values → silent (empty string)

**Impact**: Cannot show WHY a loan can't be renewed without attempting renewal. Currently shown inline on the loan list.

---

## 9. Loan `loanType` — different shape in new API

**Current**: `LoanDetailsV2.loanType: string` — values: `"loan"` or `"interLibraryLoan"`
**New API**: `LaanDetaljer.fjernlaantMaterialeMarkering: Markering!` — boolean (true = interlibrary)

**Where `loanType` drives UI behavior:**

| File | Line | Usage |
|------|------|-------|
| `react/src/core/utils/helpers/list-mapper.ts` | 70 | Maps `loanDetails.loanType` to `LoanType.loanType` |
| `react/src/apps/loan-list/materials/selectable-material/StatusMessage.tsx` | 31-34 | `loanType === "interLibraryLoan"` → shows special denial text |
| `react/src/apps/loan-list/materials/stackable-material/material-status.tsx` | 85 | Passes `loanType` to `StatusMessage` |
| `react/src/components/GroupModal/GroupModalLoansList.tsx` | 79, 86 | Passes `loanType` to `StatusMessage` |

**Impact**: Simple mapping (boolean → string), but requires adapter logic.

---

## 10. Reservation `state` — different enum values in new API

**Current values**: `"reserved"`, `"readyForPickup"`, `"interLibraryReservation"`, `"inTransit"`, `"other"`
**New API values**: `AKTIV`, `I_TRANSIT`, `KLAR_TIL_AFHENTNING`, `OPFYLDT`, `UDLØBET`, `PASSIV`

**Critical state-dependent UI logic:**

| State check | File | Line | UI behavior |
|-------------|------|------|-------------|
| `state === "readyForPickup"` | `reservation-info.tsx` | 88 | Green checkmark, shows pickup location + number |
| `state === "readyForPickup"` | `digital-list-details.tsx` | 23 | Shows expiry date |
| `state === "readyForPickup"` | `reservation-details.tsx` | 41-43 | Controls delete permission |
| `state === "readyForPickup"` | `reservation-details.tsx` | 67 | Shows "Ready for loan" label |
| `state === "reserved"` (+ queue) | `reservation-info.tsx` | 116 | Shows queue position with circle |
| `state === "reserved"` (+ deadline) | `reservation-info.tsx` | 151 | Shows days until pickup |
| `state === "reserved"` | `digital-list-details.tsx` | 32 | Shows "Borrow before" deadline |
| Mapping at entry | `list-mapper.ts` | 249 | `state === "readyForPickup" ? "readyForPickup" : "reserved"` — collapses all other states to "reserved" |

**Proposed mapping**: `KLAR_TIL_AFHENTNING` → `"readyForPickup"`, everything else → `"reserved"`. New states `OPFYLDT` (fulfilled) and `PASSIV` shouldn't appear for active reservations.

---

## 11. Reservation `transactionId` — equivalent exists in new API

**Current**: `ReservationDetailsV2.transactionId: string` — groups parallel reservations
**New API**: `ReservationDetalje.parallelTransaktionId: Tekst10` (`.gql:394`)

**Where it's used:**

| File | Line | Usage |
|------|------|-------|
| `react/src/core/utils/useGetReservationGroups.ts` | 30-34 | Groups by `transactionId` when `reservationType === "parallel"` |
| `react/src/core/utils/useGetReservationGroups.ts` | 42-54 | Takes min `numberInQueue`, builds `records` map per group |

**Impact**: Direct rename, functionally equivalent.

---

## 12. Email & phone — single value vs lists

**Current**: `PatronV5.emailAddress` (string), `PatronV5.phoneNumber` (string)
**New API**: `emailListe: [EmailDetalje]`, `telefonnummerListe: [TelefonnummerDetalje]`

**Where single-value email/phone is consumed:**

| File | Line | Field |
|------|------|-------|
| `react/src/components/contact-info-section/ContactInfoPhone.tsx` | 37 | `patron?.phoneNumber` |
| `react/src/components/contact-info-section/ContactInfoEmail.tsx` | 33 | `patron?.emailAddress` |
| `react/src/components/reservation/UserListItems.tsx` | 41, 118, 128 | Both `phoneNumber` and `emailAddress` |
| `react/src/components/reservation/OnlineInternalModalUserListItems.tsx` | 27, 45, 55 | Both fields |
| `react/src/components/reservation/forms/EmailModal.tsx` | 12, 17 | `emailAddress` |
| `react/src/components/reservation/forms/SmsModal.tsx` | 10, 15 | `phoneNumber` |
| `react/src/components/reservation/forms/helper.ts` | 20-21, 36-37 | Both fields in save data |
| `react/src/components/material/digital-modal/DigitalModal.tsx` | 62-63 | `patron.emailAddress` |
| `react/src/core/utils/useOnlineInternalHandleLoanReservation.ts` | 116-120 | Both fields in reservation request |
| `react/src/core/utils/useSavePatron.tsx` | 126-141 | Converts single values to arrays for v6 API |

**Impact**: Need to extract first item from list, or pick the one with `modtagNotifikation: true`.

---

## 13. Notification preferences — different structure

**Current**: `receiveEmail`, `receiveSms`, `receivePostalMail` booleans on patron
**New API**: `notifikationKanalListe` (channel abbreviations) + per-email/phone `modtagNotifikation` + `laanerFysiskPost`

**Where used:**

| File | Line | Field |
|------|------|-------|
| `react/src/components/reservation/forms/helper.ts` | 18-19 | `receiveSms`, `receivePostalMail`, `receiveEmail` |
| `react/src/core/utils/useSavePatron.tsx` | 130, 138 | `receiveEmail`, `receiveSms` converted to v6 format |

---

## 14. Holdings/placement structure — different nesting

**Current**: `HoldingsLogisticsV1` with flat `lmsPlacement` + `logisticsPlacement` with `branch.branchId`, `branch.title`
**New API**: `Beholdning` with nested `LMSPlacering` (`afdeling/sektion/opstilling/delopstilling`) + `cMS-delplaceringListe` (`.gql:683-707`)

**Where used:**
- `react/src/apps/material/helper.ts:612` — `useGetHoldings()` wrapper
- `react/src/apps/reservation-list/reservation-material/reservation-info.tsx:54` — branch lookup

**Note**: New API's `beholdningHent` does NOT include branch info (`filialISILNummer`/`filialNavn`) inline — only placement data. Branch-to-placement association may need a separate `filialHent` call.

---

## 15. Periodical reservation — how it works and where the code lives

**Current `Periodical` model** (`react/src/core/fbs/model/periodical.ts`):

| Current field | New API field (`Periodika`, `.gql:574-580`) | Status |
|---|---|---|
| `displayText` | `periodikaPublikationTekst` | OK |
| `volume` | `periodikaPublikationVolumen` | OK |
| `volumeNumber` | `periodikaPublikationNummer` | OK |
| `volumeYear` | `periodikaPublikationAArgang` | OK |
| — | `periodikaPublikationAAr` (year as integer) | NEW field |

**Key periodical business logic and where fields are accessed:**

| Logic | File | Line | Fields used |
|---|---|---|---|
| Display on loans | `list-mapper.ts` | 66 | `displayText` |
| Display on reservations | `list-mapper.ts` | 244, 277 | `displayText` |
| Display in modal header | `ReservationModalBody.tsx` | 293, 340 | `displayText` |
| Edition selection dropdown | `periodical/helper.ts` | 31-43 | `volume`, `volumeNumber`, `volumeYear` from holdings materials |
| Edition grouping by year | `periodical/helper.ts` | 45-61 | `volumeYear`, `volumeNumber` |
| Reservation creation payload | `reservation/helper.ts` | 111-113 | `volume`, `volumeNumber`, `volumeYear` |
| Find-on-shelf filtering | `FindOnShelfModalBody.tsx` | 119-122 | `volumeNumber`, `volumeYear` on holdings materials |

**Reservation creation input type comparison:**
- Current: `PeriodicalReservation` with `volume`, `volumeNumber`, `volumeYear`
- New API: `PeriodikaReservation` (`.gql:1034-1038`) with `periodikaPublikationVolumen`, `periodikaPublikationAArgang`, `periodikaPublikationNummer`

All fields map 1:1. No data gap.

### How periodical reservation works step by step

**Step 1: Detect periodical** — `react/src/components/material/helper.ts:16-21`
- `isPeriodical()` checks if manifestation has material type `magazine`, `periodical`, or `yearBook`

**Step 2: Extract editions from holdings** — `react/src/components/material/periodical/helper.ts:31-43`
- `makePeriodicalEditionsFromHoldings()` loops through `HoldingsLogisticsV1[].materials[]`
- For each material with `.periodical`, creates a `PeriodicalEdition` with `displayText`, `itemNumber`, `volume`, `volumeNumber`, `volumeYear`
- Source of data: FBS holdings API → `MaterialV3.periodical` fields

**Step 3: User selects edition** — `react/src/components/material/periodical/MaterialPeriodicalSelect.tsx:71-109`
- Two-level dropdown: first pick year (`volumeYear`), then pick issue (`volumeNumber`)
- `filterAndSortPeriodicalEditions()` at `periodical/helper.ts:45-61` groups by year, sorts by Danish locale

**Step 4: Selected edition flows to reservation** — `react/src/components/reservation/ReservationModalBody.tsx:80,188-193`
- `selectedPeriodical: PeriodicalEdition | null` is a prop (line 80)
- Passed to `constructReservationData()` at line 188-193

**Step 5: Build FBS request payload** — `react/src/components/reservation/helper.ts:92-120`
```
constructReservationData({
  manifestations,        // which manifestation(s) to reserve
  selectedBranch,        // pickup branch ISIL
  expiryDate,            // interest period
  periodical             // { volume, volumeNumber, volumeYear }
})
```
- Line 108-114: If `periodical` is set, includes `{ volume, volumeNumber, volumeYear }` in each `CreateReservation`
- Line 118: If multiple manifestations, sets `type: "parallel"`

**Step 6: Send to FBS** — `react/src/core/fbs/fbs.ts:644-653`
- POST `/external/v1/agencyid/patrons/patronid/reservations/v2`
- Body: `CreateReservationBatchV2 { reservations: [{ recordId, pickupBranch?, expiryDate?, periodical? }], type? }`

**Step 7: Find on Shelf filters by edition** — `react/src/components/find-on-shelf/FindOnShelfModalBody.tsx:108-133`
- When `selectedPeriodical` is set, filters holdings materials by `material.periodical?.volumeNumber === selectedPeriodical.volumeNumber` AND `material.periodical.volumeYear === selectedPeriodical.volumeYear`

**Step 8: Manifestation selection for periodicals** — `react/src/components/reservation/helper.ts:149-169`
- `getManifestationsToReserve()` — line 153-157: For periodicals, returns ALL reservable manifestations (no "latest edition" logic, since each issue is unique)

### Periodical vs new API — no data gap

All periodical fields map 1:1 (see field table above). The reservation creation payload `{ volume, volumeNumber, volumeYear }` maps to `PeriodikaReservation { periodikaPublikationVolumen, periodikaPublikationAArgang, periodikaPublikationNummer }`.

---

## 15b. Instant loan (strakslån) — BROKEN by missing branch info

The instant loan feature filters holdings to show branches where materials are available for immediate pickup.

**Decision chain and FBS fields:**

| Step | File | Line | FBS field | New API equivalent |
|---|---|---|---|---|
| Filter branches by whitelist | `reservation/helper.ts` | 229-230 | `branch.branchId` | **MISSING** on `Beholdning` |
| Consolidate same-branch holdings | `reservation/helper.ts` | 198-220 | `branch.branchId` | **MISSING** on `Beholdning` |
| Match material group to config | `reservation/helper.ts` | 239-241 | `materialGroup.name` | `materialegruppeNavn` (flat string) — OK |
| Check material available | `reservation/helper.ts` | 242 | `available` | `tilgaengeligMarkering` — OK |
| Check above threshold | `reservation/helper.ts` | 259-260 | `materials.length` | OK |
| Render instant loan section | `ReservationModalBody.tsx` | 328-336 | — | — |
| Show branch name + quantity | `InstantLoanBranch.tsx` | — | `branch.title`, `materials.length` | **MISSING** branch title |

**Verdict**: Instant loan is **completely broken** because `Beholdning` in the new API has no branch info (same root cause as gap #17a). Cannot whitelist-filter by branch, consolidate by branch, or display branch names.

---

## 15c. Parallel reservations — how it works and where the code lives

### How parallel reservations work step by step

**CREATION — when the user reserves a fictional work with multiple editions:**

**Step 1: Determine manifestations to reserve** — `react/src/components/reservation/helper.ts:149-169`
- `getManifestationsToReserve()` — line 167: For fiction, returns ALL reservable manifestations (e.g., hardcover + paperback of same novel)
- For nonfiction, returns only the latest edition (line 164)
- For periodicals, returns all (line 156)

**Step 2: Build batch payload** — `react/src/components/reservation/helper.ts:92-120`
- `constructReservationData()` creates one `CreateReservation` per manifestation (line 104)
- Line 118: `...(manifestations.length > 1 ? { type: "parallel" } : {})` — sets `type: "parallel"` when >1 manifestation
- Each reservation in the batch shares the same `pickupBranch` and `expiryDate`

**Step 3: Send to FBS as single POST** — `react/src/components/reservation/ReservationModalBody.tsx:186-194`
- `mutateAddReservations({ data: constructReservationData({...}) })`
- POST `/external/v1/agencyid/patrons/patronid/reservations/v2`
- Body: `{ reservations: [{recordId: "A"}, {recordId: "B"}], type: "parallel" }`
- FBS assigns the SAME `transactionId` to all reservations in the batch

**DISPLAY — grouping parallel reservations as one list item:**

**Step 4: Fetch reservations** — `react/src/core/utils/useGetReservationGroups.ts:71-81`
- `useGetReservationGroups()` wraps `useGetReservationsV2()` and applies grouping

**Step 5: Group by transactionId** — `react/src/core/utils/useGetReservationGroups.ts:29-59`
```
groupBy(data, (reservation) => {
  if (reservation.reservationType === "parallel") {
    return reservation.transactionId;      // line 32 — same transactionId = same group
  }
  return reservation.reservationId;        // line 34 — normal reservations: each is own group
});
```

**Step 6: Build group details** — `useGetReservationGroups.ts:37-57`
- Line 42: Uses first reservation in group as base (all fields assumed identical except recordId/reservationId)
- Line 44: `numberInQueue: min(map(reservationGroup, "numberInQueue"))` — picks LOWEST queue position
- Lines 45-54: Builds `records` map: `{ recordId → reservationId }` for each reservation in group
  - Example: `{ "46985591": 67804976, "46985592": 67804977 }`

**Step 7: Map to UI type** — `react/src/core/utils/helpers/list-mapper.ts:260-300`
- `mapFBSReservationGroupToReservationType()` converts group to display object
- Line 278: `faust: head(keys(records))` — only the FIRST recordId used for display/material lookup
- Line 286: `reservationIds: values(records)` — ALL reservation IDs preserved for deletion

**Result: One list item** — test at `reservation-list.test.ts:900` confirms two FBS reservations with same transactionId show as ONE item.

**DELETION — deleting all parallel reservations at once:**

**Step 8: Collect IDs** — `react/src/apps/reservation-list/modal/delete-reservation/helper.ts:36-39`
- `reservationIds.flat()` extracts ALL reservation IDs from the group (e.g., `[67804976, 67804977]`)

**Step 9: Send single DELETE** — `react/src/core/fbs/fbs.ts:137-143`
- DELETE `/external/v1/agencyid/patrons/patronid/reservations?reservationid=67804976&reservationid=67804977`
- All IDs sent as query params in ONE request

**Step 10: Test confirms** — `delete-reservation.test.ts:288-295`:
```
cy.intercept("DELETE",
  "**/reservations?reservationid=46985591&reservationid=46985592",
  { code: 101, message: "OK" }
).as("delete-parallel-reservation");
```

### Parallel reservations vs new API — significant structural differences

**Grouping/display fields (field renames, OK):**

| Current field | New API field | Status |
|---|---|---|
| `reservationType: "parallel"` | `rekvisitionReservationType: PARALLEL` | OK — enum vs string |
| `transactionId` (UUID string) | `parallelTransaktionId: Tekst10` | **Concern**: current uses 36-char UUIDs, new API allows max 10 chars |
| `reservationId` (number) | `rekvisitionNummer: Tekst20` (string) | OK — type change |
| `recordId` | `manifestationFAUSTNummer` | OK |

**Where parallel reservation logic runs:**

| Logic | File | Line | Fields |
|---|---|---|---|
| Group by transactionId | `useGetReservationGroups.ts` | 31-32 | `reservationType`, `transactionId` |
| Build records map | `useGetReservationGroups.ts` | 45-54 | `recordId` → `reservationId` |
| Min queue number | `useGetReservationGroups.ts` | 44 | `numberInQueue` |
| Extract all IDs for display | `list-mapper.ts` | 286 | `values(records)` → `reservationIds[]` |
| Show as single item | `reservation-list.test.ts` | 900 | Grouped by transactionId |
| Delete all in group | `delete-reservation/helper.ts` | 38-39 | `reservationIds.flat()` |
| Delete API call | `fbs.ts` | 137-143 | `reservationid: number[]` (array) |

**Parallel reservation CREATION — significant difference:**

- **Current**: ONE POST with `CreateReservationBatchV2 { reservations: CreateReservation[], type: "parallel" }` — batches multiple manifestations
  - `react/src/components/reservation/helper.ts:92-120`
  - `react/src/core/fbs/model/createReservationBatchV2.ts:9-14`
- **New API**: `reservationOpret` takes a SINGLE `manifestationFAUSTNummer` per call (`.gql:1099`)
  - No batch mechanism visible in the schema
  - Unclear how multiple manifestations get linked with same `parallelTransaktionId`

**Parallel reservation DELETION — significant difference:**

- **Current**: ONE DELETE with array `reservationid=[id1, id2, ...]` — deletes entire group at once
  - Confirmed by test at `delete-reservation.test.ts:288-295`
- **New API**: `reservationSlet` takes single `RekvisitionNummer` (`BibliotekForespoergsler.md:809`)
  - Would need multiple calls to delete a parallel group
  - Delete mutation also missing from `.gql` schema (gap #6)

---

## 16. Availability — NO GAP

**Current**: `AvailabilityV3` with `recordId`, `available`, `reservable`, `reservations`
**New API**: `TilgaengeligManifestation` with `manifestationFAUSTNummer`, `erTilgaengelig`, `kanReserveres`, `antalReservationer`

All 4 fields have direct equivalents. Business logic that depends on these fields will work with field name mapping:

| Current field | New API field | Used in | Lines |
|---|---|---|---|
| `available` | `erTilgaengelig` | `usePhysicalAvailabilityData.ts` | 58, 62 — drives "Available"/"Unavailable" label |
| `available` | `erTilgaengelig` | `material-buttons/helper.ts` | 63-65 — `areAnyAvailable()` enables reserve button |
| `reservable` | `kanReserveres` | `UseReservableManifestations.tsx` | 54, 62 — filters manifestations into reservable/unreservable |
| `reservable` | `kanReserveres` | `useAlternativeAvailableManifestation.ts` | 33 — filters for alternative editions |
| `reservations` | `antalReservationer` | `useAlternativeAvailableManifestation.ts` | 37 — sorts by fewest reservations |

---

## 17. Holdings — SIGNIFICANT structural differences

**Current**: `HoldingsForBibliographicalRecordLogisticsV1` → `HoldingsLogisticsV1[]`
**New API**: `Beholdninger` → `BeholdningManifestation[]` → `Beholdning[]`

### 17a. Branch info — MISSING from new API holdings

**Current**: Each `HoldingsLogisticsV1` has `branch: AgencyBranch` with `branchId` and `title`
**New API**: `Beholdning` has NO branch reference (`.gql:683-687`) — only `materialeListe`, `lMSPlacering`, `cMS-delplaceringListe`

**Where branch info on holdings is used:**

| File | Line | Usage |
|------|------|-------|
| `react/src/components/find-on-shelf/FindOnShelfModalBody.tsx` | 79-86 | Pairs manifestations with branch holdings |
| `react/src/components/find-on-shelf/FindOnShelfModalBody.tsx` | 158-164 | Sorts by main branch (branchId ending in "00") |
| `react/src/components/find-on-shelf/FindOnShelfModalBody.tsx` | 168-180 | Filters blacklisted branches by branchId |
| `react/src/apps/material/helper.ts` | 380-388 | `isAnyManifestationAvailableOnBranch()` — groups by branch |
| `react/src/components/reservation/helper.ts` | 198-220 | `consolidatedHoldings()` — groups by `branch.branchId` |
| `react/src/components/reservation/helper.ts` | 229-230 | Instant loan: filters branches on whitelist |

**Impact**: The "Find on Shelf" modal, instant loan logic, and branch-level availability display all depend on knowing which branch each holding belongs to. Without branch info on holdings, these features cannot function as-is.

### 17b. `logisticsPlacement` — replaced by `cMS-delplaceringListe`

**Current**: `logisticsPlacement: string[]` — first element is library name, rest are location parts
**New API**: `cMS-delplaceringListe` → `cMSPlaceringDelplacering: Tekst100!` list (`.gql:701-707`)

**Where `logisticsPlacement` is used:**

| File | Line | Usage |
|------|------|-------|
| `react/src/components/find-on-shelf/helper.tsx` | 6 | Destructured from `HoldingsLogisticsV1` |
| `react/src/components/find-on-shelf/helper.tsx` | 8-14 | `getLocationArray()` — uses `logisticsPlacement.slice(1)` (skips library name) |

**Fallback exists**: If no `logisticsPlacement`, `getLocationArray()` falls back to `lmsPlacement` (line 17-22). The new API's `LMSPlacering` has `afdeling`, `sektion`, `opstilling`, `delopstilling` — equivalent to `department`, `location`, `section`, `sublocation`.

### 17c. `materialGroup` — object vs flat string

**Current**: `MaterialV3.materialGroup: MaterialGroup` (object with `.name`)
**New API**: `materialegruppeNavn: Tekst100!` (flat string, `.gql:696`)

**Where `materialGroup.name` is used:**

| File | Line | Usage |
|------|------|-------|
| `react/src/components/reservation/helper.ts` | 239-241 | Instant loan: `materialGroup.name` matched against instant loan strings |

**Impact**: Simple adaptation — access flat string instead of `.name` property.

### 17d. Record-level fields — OK

| Current field | New API field | Status |
|---|---|---|
| `recordId` | `manifestationFAUSTNummer` | OK |
| `reservable` | `kanReserveres` | OK |
| `reservations` | `antalReservationer` | OK |

### 17e. Material-level fields — OK

| Current field | New API field | Status |
|---|---|---|
| `available` | `tilgaengeligMarkering` | OK |
| `itemNumber` | `materialeNummer` | OK |
| `periodical` | `periodika` | OK |

### Summary of availability/holdings business logic impact

| Business function | File | Status |
|---|---|---|
| Availability label (available/unavailable) | `usePhysicalAvailabilityData.ts` | OK — field rename only |
| Can reserve? filter | `UseReservableManifestations.tsx` | OK — field rename only |
| Alternative edition suggestion | `useAlternativeAvailableManifestation.ts` | OK — field rename only |
| Find on Shelf — location display | `find-on-shelf/helper.tsx` | **Needs adaptation** — fallback to lmsPlacement works, but branch info missing |
| Find on Shelf — branch sorting/filtering | `FindOnShelfModalBody.tsx` | **BROKEN** — no branch info on holdings |
| Stock & reservation count | `material/helper.ts` | OK — field rename only |
| Instant loan — branch whitelist filtering | `reservation/helper.ts:229-230` | **BROKEN** — no branch info on holdings |
| Instant loan — material group matching | `reservation/helper.ts:239-241` | **Needs adaptation** — `materialGroup.name` → `materialegruppeNavn` |
| Holdings consolidation by branch | `reservation/helper.ts:198-220` | **BROKEN** — no branch.branchId to group by |
| Branch blacklist filtering | `material/helper.ts:562-588` | OK — `exclude` param exists on `beholdningHent` query |

---

---

## WRITE OPERATIONS — Request payload comparison

### W1. Patron update — missing fields in new API mutation

**Current**: PUT `/external/agencyid/patrons/patronid/v8` with `UpdatePatronRequestV6`
**New API**: `laanerOpdater` mutation (`.gql:1096`)

| Current payload field | New API mutation param | Status |
|---|---|---|
| `pincodeChange.pincode` | `laanerPinkode: TalHel10` | OK — combined in same call |
| `pincodeChange.libraryCardNumber` | `laanerID` (separate param) | OK — not needed as separate field |
| `patron.preferredPickupBranch` | `laanerForetrukketAfhentningFilial: ISIL` | OK |
| `patron.onHold.from` | `laanerFravaersperiodeFra: Dato` | OK |
| `patron.onHold.to` | `laanerFravaersperiodeTil: Dato` | OK |
| `patron.emailAddresses[]` | `emailListe: [EmailDetalje]` | OK — different sub-fields (see below) |
| `patron.phoneNumbers[]` | `telefonnummerListe: [TelefonnummerDetalje]` | OK |
| `patron.notificationProtocols` | `notifikationKanalListe: [Tekst100]` | OK |
| `patron.interests` | `laanerInteresserListe` | OK |
| `patron.preferredLanguage` | — | **MISSING** — cannot update language preference |
| `patron.receivePostalMail` | — | **MISSING** — cannot update postal mail preference |
| `patron.guardianVisibility` | — | Not needed (no guardian concept) |

**Email sub-field comparison:**
- Current `EmailAddressV1`: `{ emailAddress, receiveNotification }`
- New `EmailDetalje`: `{ laanerEmailAdresse, modtagNotifikation, verifiseretEmail }` — adds `verifiseretEmail` (verified flag)

**Phone sub-field comparison:**
- Current `PhoneNumberV1`: `{ phoneNumber, receiveNotification }`
- New `TelefonnummerDetalje`: `{ laanerTelefonnummer, modtagNotifikation }`

**Where `preferredLanguage` is sent:**
- `react/src/core/utils/useSavePatron.tsx:110-146` — included in converted V6 settings
- `react/src/core/fbs/model/patronSettingsV6.ts:26` — field definition

**Where `receivePostalMail` is sent:**
- `react/src/core/fbs/model/patronSettingsV6.ts:29` — required boolean
- `react/src/core/utils/useSavePatron.tsx:110-146` — spread into converted settings

**Pincode reset flow — different:**
- Current: Pincode change bundled with patron update via `pincodeChange` object
- New API: Separate `pinkodeOpdater` mutation (`.gql:1097`) requires `emailUUID` — this is a **post-reset-email** flow, different from current direct pincode change

**Where pincode change is triggered:**
- `react/src/core/utils/useSavePatron.tsx:78-105` — `savePincode()` sends `pincodeChange`
- `react/src/apps/patron-page/PatronPage.tsx:90-94` — if pin changed, calls `savePincode()`

---

### W2. Reservation creation — no batch support in new API

**Current**: POST `/external/v1/agencyid/patrons/patronid/reservations/v2` with `CreateReservationBatchV2`
**New API**: `reservationOpret` mutation (`.gql:1099`)

| Current payload field | New API mutation param | Status |
|---|---|---|
| `reservations[]` (array) | Single `manifestationFAUSTNummer` | **NO BATCH** — one call per manifestation |
| `reservations[].recordId` | `manifestationFAUSTNummer: Tekst20!` | OK |
| `reservations[].pickupBranch` | `rekvisitionAfhentningssted: Tekst30` | OK |
| `reservations[].expiryDate` | `rekvisitionInteressefrist: Dato` | OK |
| `reservations[].periodical` | `periodikaReservation: PeriodikaReservation` | OK (sub-fields map 1:1) |
| `type: "parallel"` | `rekvisitionReservationType: PARALLEL` | **Unclear** — per-call vs batch-level flag |
| — | `rekvisitionAktiveringsDato: Dato` | NEW — activation date |

**Where batch creation is used:**
- `react/src/components/reservation/helper.ts:92-120` — `constructReservationData()` builds array
- `react/src/components/reservation/helper.ts:118` — sets `type: "parallel"` when `manifestations.length > 1`

**Impact**: For parallel reservations, the current API creates all linked reservations in ONE call with a shared `type: "parallel"`. The new API would need MULTIPLE calls, and it's unclear if separate calls with `PARALLEL` type will be auto-linked with the same `parallelTransaktionId`.

---

### W3. Reservation update — no batch support in new API

**Current**: PUT `/external/v1/agencyid/patrons/patronid/reservations` with `UpdateReservationBatch`
**New API**: `reservationOpdater` mutation (`.gql:1100`)

| Current payload field | New API mutation param | Status |
|---|---|---|
| `reservations[]` (array) | Single call per reservation | **NO BATCH** |
| `reservations[].reservationId` | `rekvisitionNummer: Tekst20!` | OK — type changes (number → string) |
| `reservations[].expiryDate` | `rekvisitionAfhentningsFrist: Dato` | OK |
| `reservations[].pickupBranch` | `rekvisitionAfhentningssted: Tekst30` | OK |
| — | `rekvisitionAktiveringsDato: Dato` | NEW — activation date |

**Where batch update is used:**
- `react/src/apps/reservation-list/modal/reservation-details/physical-list-details.tsx:92-115` — builds array of `UpdateReservation[]`
- `react/src/apps/reservation-list/modal/reservation-details/helper.ts:37-60` — `getReservationsForSaving()` constructs per-reservation objects

**Impact**: Currently updates multiple reservations in one call. New API requires one call per reservation. For parallel reservations (which share pickup branch/expiry), updating the group means N separate calls instead of 1.

---

### W4. Reservation deletion — no batch support, missing from schema

**Current**: DELETE `/external/v1/agencyid/patrons/patronid/reservations?reservationid=X&reservationid=Y`
**New API**: `reservationSlet` documented in markdown (`md:807-809`) — takes single `RekvisitionNummer`

| Current | New API | Status |
|---|---|---|
| Array `reservationid: number[]` (query params) | Single `RekvisitionNummer` per call | **NO BATCH** |
| One DELETE for entire parallel group | Multiple calls needed | **Significant for parallel reservations** |
| — | — | **Missing from .gql schema** (gap #6) |

**Where batch delete is used:**
- `react/src/apps/reservation-list/modal/delete-reservation/helper.ts:36-39` — `reservationIds.flat()` collects all IDs
- Test confirms: `delete-reservation.test.ts:288-295` — both parallel IDs sent in one DELETE

---

### W5. Loan renewal — OK, batch supported

**Current**: POST `/external/agencyid/patrons/patronid/loans/renew/v2` with `number[]`
**New API**: `laanForny` mutation (`.gql:1098`)

| Current payload field | New API mutation param | Status |
|---|---|---|
| `number[]` (loan IDs) | `laanIdListe: [Tekst30]!` | OK — batch supported, type changes (number → string) |

**Where used:**
- `react/src/apps/loan-list/modal/renew-button.tsx:54-59` — single loan `[renewId]`
- `react/src/components/GroupModal/LoansGroupModal.tsx:78` — batch `materialsToRenew.map(m => m.loanId)`

No gap — this is the only write operation that maps cleanly to the new API.

---

### Write operations summary

| Operation | Current approach | New API approach | Gap |
|---|---|---|---|
| **Patron update** | One PUT with all settings + optional pincode | `laanerOpdater` with most fields | **Missing** `preferredLanguage`, `receivePostalMail` |
| **Patron pincode** | Bundled with patron update | `laanerOpdater` accepts `laanerPinkode` directly | OK for normal change; `pinkodeOpdater` is post-reset-email only |
| **Create reservation** | One POST with batch of manifestations + `type` | One `reservationOpret` per manifestation | **No batch** — parallel linking unclear |
| **Update reservation** | One PUT with batch of updates | One `reservationOpdater` per reservation | **No batch** |
| **Delete reservation** | One DELETE with array of IDs | One `reservationSlet` per ID (not in .gql) | **No batch**, missing from schema |
| **Renew loans** | One POST with array of loan IDs | `laanForny` with `laanIdListe` array | OK |
| **Create patron** | One POST | — | **MISSING entirely** |

---

## Endpoint mapping summary

| Current REST endpoint | New GraphQL operation | Status |
|---|---|---|
| `GET /patrons/patronid/v4` | `laanerHent` | **Partial** — missing `name`, `address` |
| `PUT /patrons/patronid/v8` | `laanerOpdater` | OK — different structure for email/phone/notifications |
| `POST /patrons/v9` (create) | — | **MISSING** |
| `POST /patrons/withGuardian/v1` | — | Not used in React app |
| `PUT /patrons/withGuardian/v1` | — | Not used in React app |
| `GET /patrons/patronid/loans/v2` | `laanHent` | OK — missing `renewalStatusList` on loan objects |
| `POST /patrons/patronid/loans/renew/v2` | `laanForny` | OK |
| `GET /patrons/patronid/reservations/v2` | `reservationHent` | OK — different state enums |
| `POST /patrons/patronid/reservations/v2` | `reservationOpret` | OK |
| `PUT /patrons/patronid/reservations` | `reservationOpdater` | OK |
| `DELETE /patrons/patronid/reservations` | `reservationSlet` | **In docs, not in .gql** |
| `GET /patrons/patronid/fees/v2` | `laanerMellemvaerendeHent` | **Partial** — missing `payableByClient`, no filter params |
| `GET /catalog/availability/v3` | `tilgaengelighedHent` | OK — full equivalent |
| `GET /catalog/holdingsLogistics/v1` | `beholdningHent` | **BROKEN** — no branch info on holdings; `logisticsPlacement` replaced |
| `GET /branches` | `filialHent` | OK — full equivalent |

## Go backend impact
The Go backend only uses FBS directly for server-side patron data loading during auth (`go/lib/helpers/fbs.ts`). All other FBS calls go through a generic AP-service proxy (`go/app/(routes)/ap-service/[[...slug]]/route.ts`). No additional FBS dependencies beyond the React frontend.
