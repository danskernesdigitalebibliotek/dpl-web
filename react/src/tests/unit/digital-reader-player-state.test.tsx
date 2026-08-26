import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  type LoanDecision,
  type DigitalLoan,
  type DigitalReservation
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import useDigitalReaderPlayerState from "../../core/utils/useDigitalReaderPlayerState";
import {
  useLoanDecision,
  useDigitalLoans,
  useDigitalReservations
} from "@danskernesdigitalebibliotek/dpl-service-layer";
import { isAnonymous } from "../../core/utils/helpers/user";

// Only the hooks under test are stubbed; the rest of the package stays
// real, so pure helpers keep behaving as they do in production.
vi.mock(
  "@danskernesdigitalebibliotek/dpl-service-layer",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@danskernesdigitalebibliotek/dpl-service-layer")
    >()),
    useLoanDecision: vi.fn(),
    useDigitalLoans: vi.fn(),
    useDigitalReservations: vi.fn()
  })
);

/**
 * What the adapter says about one material, translated into the four states
 * the material page renders from.
 *
 * Publizon answers all of this from a single loan status code. Biblio splits
 * it across can-loan, the user's loans and their reservations, so the
 * translation is where the transition can go wrong - and where a mistake is
 * invisible until a user cannot borrow something.
 */

vi.mock("../../core/utils/helpers/user", () => ({ isAnonymous: vi.fn() }));
// TEMPORARY toleration flag; reads config from Redux, which these bare hook
// renders have no provider for. Off keeps the strict default under test.
vi.mock("../../core/digital/useTolerateUnknownMaterials", () => ({
  default: () => false
}));

const IDENTIFIER = "9788727319346";
const LOAN_ID = "3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b90";
const RESERVATION_ID = "e5b4bbd1-6d63-4a24-9a25-2f0f4e9b1f11";
const OFFER_ID = "9a1c7f30-4d62-4e18-b5a7-2c8e6f0b3d94";

const loan: DigitalLoan = {
  loanId: LOAN_ID,
  materialId: IDENTIFIER,
  materialType: "ebook",
  startDate: "2022-10-19T08:15:00.000Z",
  endDate: "2022-11-16T08:15:00.000Z",
  active: true,
  title: "Din for en sommer",
  author: "Sherman, L.",
  publisher: "Lindhardt og Ringhof",
  publishDate: "2022-06-18T00:00:00.000Z",
  loanProvider: "selection"
};

const reservation: DigitalReservation = {
  reservationId: RESERVATION_ID,
  materialId: IDENTIFIER,
  materialType: "ebook",
  createdDate: "2022-10-19T06:32:30.000Z",
  expectedLoanDate: "2022-11-10T06:32:30.000Z"
};

const givenAdapterSays = ({
  status,
  loans = [],
  reservations = [],
  anonymous = false
}: {
  status?: LoanDecision["status"];
  loans?: DigitalLoan[];
  reservations?: DigitalReservation[];
  anonymous?: boolean;
}) => {
  vi.mocked(isAnonymous).mockReturnValue(anonymous);
  vi.mocked(useLoanDecision).mockReturnValue({
    data: status ? { status } : undefined,
    isLoading: false
  } as unknown as ReturnType<typeof useLoanDecision>);
  vi.mocked(useDigitalLoans).mockReturnValue({
    data: { loans },
    isLoading: false
  } as unknown as ReturnType<typeof useDigitalLoans>);
  vi.mocked(useDigitalReservations).mockReturnValue({
    data: { reservations },
    isLoading: false
  } as unknown as ReturnType<typeof useDigitalReservations>);
};

const render = (identifier: string | null = IDENTIFIER, enabled = true) =>
  renderHook(() => useDigitalReaderPlayerState({ identifier, enabled })).result
    .current;

describe("useDigitalReaderPlayerState", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("what the user can do with the material", () => {
    it("Offers the loan when the adapter says the material is loanable", () => {
      givenAdapterSays({ status: "loanable" });

      expect(render()).toMatchObject({
        canBeLoaned: true,
        canBeReserved: false
      });
    });

    it("Offers the queue when the adapter says the material is reservable", () => {
      givenAdapterSays({ status: "reservable" });

      expect(render()).toMatchObject({
        canBeLoaned: false,
        canBeReserved: true
      });
    });

    it.each(["wishable", "unavailable"] as const)(
      "Offers nothing for a %s material",
      (status) => {
        // Wishing is not reserving, and there is no Publizon equivalent to
        // render it with.
        givenAdapterSays({ status });

        expect(render()).toMatchObject({
          canBeLoaned: false,
          canBeReserved: false
        });
      }
    );

    it.each([
      "monthly_limit_exceeded",
      "concurrent_limit_exceeded",
      "lending_blocked",
      "no_valid_credentials"
    ] as const)("Offers nothing when the user is blocked by %s", (status) => {
      // These describe the user rather than the material. Publizon's status 0
      // behaves the same way, so this is inherited rather than chosen.
      givenAdapterSays({ status });

      expect(render()).toMatchObject({
        canBeLoaned: false,
        canBeReserved: false
      });
    });
  });

  describe("what the user already has", () => {
    it("Recognises a loan and hands over the key that opens it", () => {
      givenAdapterSays({ status: "loanable", loans: [loan] });

      // The Biblio loan id takes the role Publizon's order id plays.
      expect(render()).toMatchObject({
        isAlreadyLoaned: true,
        orderId: LOAN_ID
      });
    });

    it("Ignores a loan for a different material", () => {
      givenAdapterSays({
        status: "loanable",
        loans: [{ ...loan, materialId: "9788740082265" }]
      });

      expect(render()).toMatchObject({
        isAlreadyLoaned: false,
        orderId: null
      });
    });

    it("Counts a reservation without an offer as queued and cancellable", () => {
      givenAdapterSays({ status: "reservable", reservations: [reservation] });

      const state = render();

      expect(state.isAlreadyReserved).toBe(true);
      expect(state.offerId).toBeNull();
      // Cancelling has to target the adapter, which the mapped reservation id
      // is what makes possible.
      expect(state.reservation?.digitalReservationId).toBe(RESERVATION_ID);
    });

    it("Turns an offered reservation into something the user can borrow", () => {
      givenAdapterSays({
        status: "reservable",
        reservations: [{ ...reservation, offerId: OFFER_ID }]
      });

      const state = render();

      // The offer overrides a "reservable" material: the user is past the
      // queue and can claim it, even though the material itself is not free.
      expect(state.canBeLoaned).toBe(true);
      expect(state.offerId).toBe(OFFER_ID);
      // And there is nothing left to cancel from here.
      expect(state.isAlreadyReserved).toBe(false);
      expect(state.reservation).toBeNull();
    });
  });

  describe("when the adapter must not be asked", () => {
    it("Offers the loan to an anonymous user so the login guard takes over", () => {
      givenAdapterSays({ status: "unavailable", anonymous: true });

      // Every endpoint behind this hook needs an end-user token, so nothing is
      // known about the user yet - the same deal Publizon gets.
      expect(render()).toMatchObject({
        canBeLoaned: true,
        isAlreadyLoaned: false,
        isLoading: false
      });
    });

    it("Knows nothing when another provider holds the material", () => {
      givenAdapterSays({ status: "loanable", loans: [loan] });

      expect(render(IDENTIFIER, false)).toMatchObject({
        canBeLoaned: false,
        canBeReserved: false,
        isAlreadyLoaned: false,
        orderId: null
      });
    });

    it("Knows nothing without an identifier to ask about", () => {
      givenAdapterSays({ status: "loanable" });

      expect(render(null)).toMatchObject({ canBeLoaned: false });
    });
  });
});
