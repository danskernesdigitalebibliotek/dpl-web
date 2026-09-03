import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useReaderPlayer from "../../core/utils/useReaderPlayer";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import useBiblioReaderPlayerState from "../../core/utils/useBiblioReaderPlayerState";
import usePublizonReaderPlayerState from "../../core/utils/usePublizonReaderPlayerState";
import {
  ReaderPlayerState,
  unknownReaderPlayerState
} from "../../core/utils/types/reader-player-state";

/**
 * Two questions, two answers.
 *
 * Acquiring a material follows the library's chosen provider - with the
 * adapter on it is the only one asked, and a material it cannot lend is not
 * offered rather than quietly borrowed from Publizon. Reading one the user
 * already holds follows whoever holds it, so loans made before the switch
 * keep their old reader.
 *
 * Getting this composition wrong is invisible until it is expensive: either
 * new loans keep landing in the service being migrated away from, or a user's
 * existing loans stop opening.
 */

vi.mock("../../core/utils/useBiblioAdapter", () => ({ default: vi.fn() }));
vi.mock("../../core/utils/useBiblioReaderPlayerState", () => ({
  default: vi.fn()
}));
vi.mock("../../core/utils/usePublizonReaderPlayerState", () => ({
  default: vi.fn()
}));
vi.mock("../../apps/material/helper", () => ({
  getManifestationDigitalIdentifier: () => "9788727319346"
}));
vi.mock("../../components/reader-player/helper", () => ({
  getReaderPlayerType: () => "reader"
}));

const PUBLIZON_ORDER_ID = "publizon-order-1";
const BIBLIO_LOAN_ID = "3f7b1c62-9d4e-4a71-b0c3-1d5a8e2f4b90";

const state = (overrides: Partial<ReaderPlayerState>): ReaderPlayerState => ({
  ...unknownReaderPlayerState,
  isLoading: false,
  ...overrides
});

const given = ({
  flagOn,
  biblio = {},
  publizon = {}
}: {
  flagOn: boolean;
  biblio?: Partial<ReaderPlayerState>;
  publizon?: Partial<ReaderPlayerState>;
}) => {
  vi.mocked(useBiblioAdapter).mockReturnValue(flagOn);
  vi.mocked(useBiblioReaderPlayerState).mockReturnValue(state(biblio));
  vi.mocked(usePublizonReaderPlayerState).mockReturnValue(state(publizon));
};

const render = () =>
  renderHook(() => useReaderPlayer({} as never)).result.current;

describe("useReaderPlayer - which provider answers what", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("acquiring a material", () => {
    it("Asks only the adapter once the library has enabled it", () => {
      given({
        flagOn: true,
        biblio: { canBeLoaned: true },
        publizon: { canBeReserved: true }
      });

      expect(render()).toMatchObject({
        canBeLoaned: true,
        canBeReserved: false
      });
    });

    it("Does not offer a material the adapter cannot lend, whatever Publizon says", () => {
      // The regression that matters: Publizon would happily lend this, and
      // that is exactly what must not happen after the switch.
      given({
        flagOn: true,
        biblio: { canBeLoaned: false, canBeReserved: false },
        publizon: { canBeLoaned: true, canBeReserved: true }
      });

      expect(render()).toMatchObject({
        canBeLoaned: false,
        canBeReserved: false
      });
    });

    it("Asks Publizon while the library has not enabled the adapter", () => {
      given({
        flagOn: false,
        biblio: { canBeLoaned: true },
        publizon: { canBeLoaned: true }
      });

      expect(render().canBeLoaned).toBe(true);
    });

    it("Takes the offer to claim from the lending provider", () => {
      given({
        flagOn: true,
        biblio: { offerId: "offer-1", canBeLoaned: true }
      });

      expect(render().offerId).toBe("offer-1");
    });
  });

  describe("a material the user already holds", () => {
    it("Opens an old Publizon loan in its own reader after the switch", () => {
      // The loan was made in Publizon and lives there; the adapter knows
      // nothing about it. Losing this would strand every loan made before the
      // library switched.
      given({
        flagOn: true,
        biblio: { isAlreadyLoaned: false },
        publizon: { isAlreadyLoaned: true, orderId: PUBLIZON_ORDER_ID }
      });

      expect(render()).toMatchObject({
        isAlreadyLoaned: true,
        orderId: PUBLIZON_ORDER_ID,
        // The key alone cannot say which reader opens it - the two ids are
        // indistinguishable by shape, so this is what routes the button.
        holdingProvider: "publizon"
      });
    });

    it("Opens a Biblio loan with the adapter's own key", () => {
      given({
        flagOn: true,
        biblio: { isAlreadyLoaned: true, orderId: BIBLIO_LOAN_ID },
        publizon: { isAlreadyLoaned: false }
      });

      expect(render()).toMatchObject({
        orderId: BIBLIO_LOAN_ID,
        holdingProvider: "biblio"
      });
    });

    it("Lets the user cancel a reservation held in either service", () => {
      given({
        flagOn: true,
        biblio: { isAlreadyReserved: false },
        publizon: {
          isAlreadyReserved: true,
          reservation: { identifier: "9788727319346" }
        }
      });

      expect(render()).toMatchObject({
        isAlreadyReserved: true,
        reservation: { identifier: "9788727319346" }
      });
    });
  });
});
