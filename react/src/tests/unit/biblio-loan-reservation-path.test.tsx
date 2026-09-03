import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useOnlineInternalHandleLoanReservation from "../../core/utils/useOnlineInternalHandleLoanReservation";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import {
  useBiblioCreateLoan,
  useBiblioCreateReservation,
  useBiblioAcceptOffer
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useReaderPlayer from "../../core/utils/useReaderPlayer";
import {
  usePostV1UserLoansIdentifier,
  usePostV1UserReservationsIdentifier
} from "../../core/publizon/publizon";

// Only the hooks under test are stubbed; the rest of the package stays
// real, so pure helpers keep behaving as they do in production.
vi.mock(
  "@danskernesdigitalebibliotek/dpl-service-layer",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@danskernesdigitalebibliotek/dpl-service-layer")
    >()),
    useBiblioCreateLoan: vi.fn(),
    useBiblioCreateReservation: vi.fn(),
    useBiblioAcceptOffer: vi.fn()
  })
);

/**
 * Which service a digital loan or reservation is created through.
 *
 * With the adapter enabled it takes every new loan and reservation, and there
 * is no falling back to Publizon: a material the adapter cannot lend is never
 * reported as obtainable in the first place, so these branches are not
 * reached. Quietly borrowing it from Publizon instead would keep pulling new
 * loans into the service being migrated away from.
 *
 * The other half is the offer flow. Publizon has no separate redeem step, so
 * a redeemable reservation just shows the loan button; Biblio makes accepting
 * explicit.
 */

const IDENTIFIER = "9788727319346";
const OFFER_ID = "9a1c7f30-4d62-4e18-b5a7-2c8e6f0b3d94";

vi.mock("../../core/utils/useBiblioAdapter", () => ({ default: vi.fn() }));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() })
}));

vi.mock("../../core/publizon/publizon", () => ({
  usePostV1UserLoansIdentifier: vi.fn(),
  usePostV1UserReservationsIdentifier: vi.fn(),
  getGetV1LoanstatusIdentifierQueryKey: () => ["loanstatus"],
  getGetV1UserLoansQueryKey: () => ["loans"],
  getGetV1UserReservationsQueryKey: () => ["reservations"]
}));

vi.mock("../../core/biblio/useBiblioReservations", () => ({
  biblioReservationsQueryKey: ["biblio", "reservations"]
}));
vi.mock("../../core/biblio/useBiblioLoans", () => ({
  default: vi.fn(),
  biblioLoansQueryKey: ["biblio", "loans"]
}));

vi.mock("../../core/utils/useReaderPlayer", () => ({ default: vi.fn() }));
vi.mock("../../core/utils/helpers/usePatronData", () => ({
  usePatronData: () => ({
    data: { patron: { emailAddress: "a@b.dk", phoneNumber: "12345678" } }
  })
}));
vi.mock("../../core/utils/url", () => ({ useUrls: () => () => "auth-url" }));
vi.mock("../../core/utils/modal", () => ({
  useModalButtonHandler: () => ({ openGuarded: vi.fn() })
}));
vi.mock("../../core/statistics/useStatistics", () => ({
  useEventStatistics: () => ({ track: vi.fn() })
}));
vi.mock("../../apps/material/helper", () => ({
  getLoanableManifestation: () => ({}),
  onlineInternalModalId: () => "modal-id"
}));

const mutations = {
  publizonLoan: vi.fn(),
  publizonReservation: vi.fn(),
  biblioLoan: vi.fn(),
  biblioReservation: vi.fn(),
  biblioAcceptOffer: vi.fn()
};

type Scenario = {
  /** Whether the library has enabled the adapter. */
  flagOn: boolean;
  canBeLoaned?: boolean;
  canBeReserved?: boolean;
  /**
   * The pending grant useReaderPlayer reports for this material. Only Biblio
   * hands one out, so a Publizon material always leaves it null.
   */
  offerId?: string | null;
};

const givenScenario = ({
  flagOn,
  canBeLoaned = false,
  canBeReserved = false,
  offerId = null
}: Scenario) => {
  vi.mocked(useBiblioAdapter).mockReturnValue(flagOn);
  // useReaderPlayer only reports a material as obtainable when the lending
  // provider said so, which is why these two travel together.
  vi.mocked(useReaderPlayer).mockReturnValue({
    canBeLoaned,
    canBeReserved,
    identifier: IDENTIFIER,
    offerId
  } as unknown as ReturnType<typeof useReaderPlayer>);

  const asMutation = (mutate: unknown) =>
    ({ mutate }) as unknown as ReturnType<typeof useBiblioCreateLoan>;

  vi.mocked(usePostV1UserLoansIdentifier).mockReturnValue(
    asMutation(mutations.publizonLoan) as never
  );
  vi.mocked(usePostV1UserReservationsIdentifier).mockReturnValue(
    asMutation(mutations.publizonReservation) as never
  );
  vi.mocked(useBiblioCreateLoan).mockReturnValue(
    asMutation(mutations.biblioLoan)
  );
  vi.mocked(useBiblioCreateReservation).mockReturnValue(
    asMutation(mutations.biblioReservation) as never
  );
  vi.mocked(useBiblioAcceptOffer).mockReturnValue(
    asMutation(mutations.biblioAcceptOffer) as never
  );
};

const runHandler = () => {
  const { result } = renderHook(() =>
    useOnlineInternalHandleLoanReservation({
      manifestations: [],
      openModal: false,
      workId: "work-1" as never
    })
  );
  result.current();
};

describe("Digital loans and reservations - which service is used", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("with the adapter disabled", () => {
    it("Creates the loan in Publizon and never touches the adapter", () => {
      givenScenario({ flagOn: false, canBeLoaned: true });

      runHandler();

      expect(mutations.publizonLoan).toHaveBeenCalledTimes(1);
      expect(mutations.biblioLoan).not.toHaveBeenCalled();
      expect(mutations.biblioAcceptOffer).not.toHaveBeenCalled();
    });

    it("Creates the reservation in Publizon", () => {
      givenScenario({ flagOn: false, canBeReserved: true });

      runHandler();

      expect(mutations.publizonReservation).toHaveBeenCalledTimes(1);
      expect(mutations.biblioReservation).not.toHaveBeenCalled();
    });
  });

  describe("with the adapter enabled", () => {
    it("Creates the loan through the adapter, not Publizon", () => {
      givenScenario({ flagOn: true, canBeLoaned: true });

      runHandler();

      expect(mutations.biblioLoan).toHaveBeenCalledWith(
        IDENTIFIER,
        expect.anything()
      );
      expect(mutations.publizonLoan).not.toHaveBeenCalled();
    });

    it("Creates the reservation through the adapter, not Publizon", () => {
      givenScenario({ flagOn: true, canBeReserved: true });

      runHandler();

      // The adapter derives the user from the token, so unlike Publizon it
      // needs no contact details.
      expect(mutations.biblioReservation).toHaveBeenCalledWith(
        IDENTIFIER,
        expect.anything()
      );
      expect(mutations.publizonReservation).not.toHaveBeenCalled();
    });

    it("Accepts an existing offer instead of borrowing the material again", () => {
      givenScenario({
        flagOn: true,
        canBeLoaned: true,
        offerId: OFFER_ID
      });

      runHandler();

      // Publizon has no explicit redeem step - a redeemable reservation just
      // shows the loan button - but Biblio separates the two.
      expect(mutations.biblioAcceptOffer).toHaveBeenCalledWith(
        OFFER_ID,
        expect.anything()
      );
      expect(mutations.biblioLoan).not.toHaveBeenCalled();
    });

    it("Creates a loan when there is no offer to accept", () => {
      // Which offer belongs to which material is decided in useReaderPlayer,
      // so here the absence of one simply means a fresh loan.
      givenScenario({ flagOn: true, canBeLoaned: true, offerId: null });

      runHandler();

      expect(mutations.biblioAcceptOffer).not.toHaveBeenCalled();
      expect(mutations.biblioLoan).toHaveBeenCalledTimes(1);
    });
  });
  describe("when the adapter refuses a reservation", () => {
    it("Does not tell the user they are queued", () => {
      // The adapter answers 200 with a decision rather than an HTTP error, so
      // the status is the only thing separating a queue place from a spent
      // quota.
      givenScenario({ flagOn: true, canBeReserved: true });
      mutations.biblioReservation.mockImplementation(
        (_id: string, { onSuccess }: { onSuccess: (r: unknown) => void }) =>
          onSuccess({ status: "monthly_limit_exceeded", loan: undefined })
      );
      const setReservationStatus = vi.fn();

      renderHook(() =>
        useOnlineInternalHandleLoanReservation({
          manifestations: [],
          openModal: false,
          workId: "work-1" as never,
          setReservationStatus
        })
      ).result.current();

      expect(setReservationStatus).toHaveBeenCalledWith("error");
      expect(setReservationStatus).not.toHaveBeenCalledWith("success");
    });

    it("Reports success when the reservation was actually made", () => {
      givenScenario({ flagOn: true, canBeReserved: true });
      mutations.biblioReservation.mockImplementation(
        (_id: string, { onSuccess }: { onSuccess: (r: unknown) => void }) =>
          onSuccess({ status: "reservable", loan: undefined })
      );
      const setReservationStatus = vi.fn();

      renderHook(() =>
        useOnlineInternalHandleLoanReservation({
          manifestations: [],
          openModal: false,
          workId: "work-1" as never,
          setReservationStatus
        })
      ).result.current();

      expect(setReservationStatus).toHaveBeenCalledWith("success");
    });
  });
  describe("when the adapter cannot lend the material", () => {
    it("Writes to neither service", () => {
      // useReaderPlayer reports nothing obtainable, because with the flag on
      // the adapter is the only one asked. The material is simply not offered
      // - it must never quietly fall through to Publizon.
      givenScenario({ flagOn: true, canBeLoaned: false, canBeReserved: false });

      runHandler();

      expect(mutations.biblioLoan).not.toHaveBeenCalled();
      expect(mutations.biblioReservation).not.toHaveBeenCalled();
      expect(mutations.publizonLoan).not.toHaveBeenCalled();
      expect(mutations.publizonReservation).not.toHaveBeenCalled();
    });
  });
});
