import { Factory } from "fishery";
import {
  type AcceptReservationOfferApiResponse,
  type CanLoanApiResponse,
  type CreateLoanApiResponse,
  type DeleteReservationApiResponse,
  type GetLoanQuotasApiResponse,
  type GetLoansApiResponse,
  type GetMetadataApiResponse,
  type GetReservationsApiResponse,
  type GetSupportIdApiResponse,
  type LoanDto,
  type ReservationDto,
  type SplitLoanQuotaDto,
  CanLoanResponseType,
  LoanProvider,
  MaterialType,
  RequestLoanRequestType,
  RequestLoanReservationGroup
} from "@danskernesdigitalebibliotek/dpl-service-layer/biblio/contract";

/**
 * Factories for Biblio adapter (WeDoBooks) responses. The types are generated
 * from `schemas/openapi/biblio-adapter.yaml`, so a body that drifts from the
 * contract fails to typecheck rather than quietly testing a response the
 * adapter would never send.
 */

export const BIBLIO_ORG_ID = "biblio-test-org-0001";
const USER_ID = "user-000000-001";

export const BIBLIO_MATERIAL = {
  ebook: {
    isbn: "9788727319346",
    title: "Din for en sommer",
    author: "Sherman, L.",
    publisher: "Lindhardt og Ringhof",
    publisherId: "lr-001",
    publishDate: "2022-06-18T00:00:00.000Z"
  },
  audiobook: {
    isbn: "9788740082265",
    title: "Terræn",
    author: "Rugaard, Ida",
    publisher: "Gyldendal",
    publisherId: "gyl-014",
    publishDate: "2021-03-04T00:00:00.000Z"
  }
} as const;

/**
 * A single loan, `LoanDto`. The contract requires `title`, `author`,
 * `publish_date` and `publisher`, so a loan describes itself and needs no
 * metadata lookup. `author` is one string here, a list on the metadata
 * endpoints.
 */
export const biblioLoanFactory = Factory.define<LoanDto>(({ sequence }) => ({
  id: `3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b${String(sequence).padStart(2, "0")}`,
  material_id: BIBLIO_MATERIAL.ebook.isbn,
  material_type: MaterialType.ebook,
  title: BIBLIO_MATERIAL.ebook.title,
  author: BIBLIO_MATERIAL.ebook.author,
  publisher: BIBLIO_MATERIAL.ebook.publisher,
  publisher_id: BIBLIO_MATERIAL.ebook.publisherId,
  publish_date: BIBLIO_MATERIAL.ebook.publishDate,
  start: "2022-10-19T08:15:00.000Z",
  end: "2022-11-16T08:15:00.000Z",
  active: true,
  is_listen_and_read: false,
  lix: 24,
  license: {
    id: "lic-selection-001",
    type: LoanProvider.selection
  },
  loan_request_type: RequestLoanRequestType.loan,
  org_id: BIBLIO_ORG_ID,
  org_type: "municipality",
  origin_org_id: BIBLIO_ORG_ID,
  origin_org_type: "municipality",
  uid: USER_ID
}));

/**
 * An audiobook loan. `duration` and `is_listen_and_read` only carry meaning
 * for this material type.
 */
export const biblioAudiobookLoanFactory = biblioLoanFactory.params({
  material_id: BIBLIO_MATERIAL.audiobook.isbn,
  material_type: MaterialType.audiobook,
  title: BIBLIO_MATERIAL.audiobook.title,
  author: BIBLIO_MATERIAL.audiobook.author,
  publisher: BIBLIO_MATERIAL.audiobook.publisher,
  publisher_id: BIBLIO_MATERIAL.audiobook.publisherId,
  publish_date: BIBLIO_MATERIAL.audiobook.publishDate,
  start: "2022-10-14T19:40:00.000Z",
  end: "2022-10-24T19:40:00.000Z",
  duration: 27180,
  is_listen_and_read: true,
  license: {
    id: "lic-package-002",
    type: LoanProvider.package
  }
});

/** `GET /v1/loans` */
export const biblioLoansFactory = Factory.define<GetLoansApiResponse>(() => ({
  loans: [],
  pagination: { limit: 25 }
}));

/**
 * A single reservation, `ReservationDto`. Unlike a loan it carries no title,
 * so it has to be described through the metadata endpoints.
 */
export const biblioReservationFactory = Factory.define<ReservationDto>(
  ({ sequence }) => ({
    id: `e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f${String(sequence).padStart(2, "0")}`,
    material_id: BIBLIO_MATERIAL.ebook.isbn,
    material_type: MaterialType.ebook,
    duration: 0,
    org_id: BIBLIO_ORG_ID,
    org_ids: [BIBLIO_ORG_ID],
    uid: USER_ID,
    type: RequestLoanReservationGroup.reservation,
    word_count: 62000,
    timestamp: "2022-10-19T06:32:30.000Z",
    loan_date: "2022-11-10T06:32:30.000Z"
  })
);

export const biblioOfferedReservationFactory = biblioReservationFactory.params({
  offer_id: "9a1c7f30-4d62-4e18-b5a7-2c8e6f0b3d94",
  offer_expires_at: "2022-10-24T06:32:30.000Z"
});

/** `GET /v1/reservations` */
export const biblioReservationsFactory =
  Factory.define<GetReservationsApiResponse>(() => ({
    reservations: [],
    pagination: { limit: 25 }
  }));

/** `GET /v1/metadata` and `GET /v1/metadata/{material_id}`. Unknown materials
 * are omitted from the array rather than failing the request. */
export const biblioMetadataFactory = Factory.define<GetMetadataApiResponse>(
  () => ({
    materials: []
  })
);

/** `GET /v1/users/get_support_id` - the equivalent of Publizon's friendly
 * card number. */
export const biblioSupportIdFactory = Factory.define<GetSupportIdApiResponse>(
  () => ({
    support_id: "BIB-000000-0001"
  })
);

/**
 * `GET /v1/users/get_loan_quotas`, split on format. Two sets of counters: the
 * monthly ones back the "this month" texts on a material, the concurrent ones
 * the profile page's "loans you hold right now".
 */
export const biblioSplitLoanQuotaFactory = Factory.define<SplitLoanQuotaDto>(
  () => ({
    org_id: BIBLIO_ORG_ID,
    org_name: "Eksempel Biblioteket",
    ancestors: [],
    split_on_format: true,
    max_user_loans: { ebook: 10, audiobook: 8 },
    max_concurrent_user_loans: { ebook: 4, audiobook: 3 },
    current_concurrent_loans: { ebook: 1, audiobook: 2 },
    current_monthly_loans: { ebook: 3, audiobook: 5 }
  })
);

export const biblioLoanQuotasFactory = Factory.define<GetLoanQuotasApiResponse>(
  () => ({
    loan_quotas: [biblioSplitLoanQuotaFactory.build()]
  })
);

/** `GET /v1/loans/can-loan`. The material is available by default. */
export const biblioCanLoanFactory = Factory.define<CanLoanApiResponse>(() => ({
  status: CanLoanResponseType.loanable,
  // An ordinary paid loan: the default material costs quota. Blue titles
  // override with the quota-free "selection" licence.
  loan_provider: LoanProvider.click,
  active_loan_provider: true,
  org_id: BIBLIO_ORG_ID
}));

/**
 * `DELETE /v1/reservations/{reservation_id}`. The contract answers 200 with a
 * body, not 204 - the client parses it, so an empty stub is not valid.
 */
export const biblioDeleteReservationFactory =
  Factory.define<DeleteReservationApiResponse>(() => ({
    success: true
  }));

/** `POST /v1/reservations/accept-offer` */
export const biblioAcceptOfferFactory =
  Factory.define<AcceptReservationOfferApiResponse>(() => ({
    success: true,
    loan_id: "3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b01"
  }));

/** `POST /v1/loans` */
export const biblioCreateLoanFactory = Factory.define<CreateLoanApiResponse>(
  () => ({
    status: CanLoanResponseType.loanable,
    loan_provider: LoanProvider.selection,
    org_id: BIBLIO_ORG_ID,
    loan: biblioLoanFactory.build()
  })
);
