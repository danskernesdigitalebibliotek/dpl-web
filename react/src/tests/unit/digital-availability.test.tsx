import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import useDigitalAvailability from "../../core/digital/useDigitalAvailability";
import { useDigitalLoanDecision } from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isAnonymous } from "../../core/utils/helpers/user";

// Only the query is stubbed. isMaterialAvailable stays real - it is the
// rule this hook is here to apply, and a copy of it in the test would pass
// whatever the package does.
vi.mock(
  "@danskernesdigitalebibliotek/dpl-service-layer",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@danskernesdigitalebibliotek/dpl-service-layer")
    >()),
    useDigitalLoanDecision: vi.fn()
  })
);
vi.mock("../../core/utils/useBiblioAdapter", () => ({
  default: vi.fn()
}));
vi.mock("../../core/utils/helpers/user", () => ({ isAnonymous: vi.fn() }));

const mockedLoanDecision = vi.mocked(useDigitalLoanDecision);
const mockedFlag = vi.mocked(useBiblioAdapter);
const mockedIsAnonymous = vi.mocked(isAnonymous);

const ISBN = "9788727319346";

const givenAdapterAnswers = (status: string) =>
  mockedLoanDecision.mockReturnValue({
    data: { status },
    isLoading: false
  } as unknown as ReturnType<typeof useDigitalLoanDecision>);

const render = (isbn: string | null = ISBN, enabled = true) =>
  renderHook(() => useDigitalAvailability({ enabled, isbn }));

/**
 * The hook that decides availability for the materials Biblio provides. The
 * `useOnlineAvailabilityData` tests mock this away, so without these its own
 * gate and its reading of Biblio's status would be untested.
 */
describe("useDigitalAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFlag.mockReturnValue(true);
    mockedIsAnonymous.mockReturnValue(false);
    mockedLoanDecision.mockReturnValue({
      data: undefined,
      isLoading: false
    } as unknown as ReturnType<typeof useDigitalLoanDecision>);
  });

  it("Answers for the material when the library has enabled the flag", () => {
    const { result } = render();

    expect(result.current.isAnswering).toBe(true);
    expect(mockedLoanDecision).toHaveBeenCalledWith(ISBN, {
      enabled: true
    });
  });

  it("Leaves Biblio alone when the flag is off", () => {
    mockedFlag.mockReturnValue(false);

    const { result } = render();

    expect(result.current.isAnswering).toBe(false);
    // The query is still declared - hooks cannot be conditional - but it is
    // disabled, so no request is made.
    expect(mockedLoanDecision).toHaveBeenCalledWith(ISBN, {
      enabled: false
    });
  });

  it("Leaves Biblio alone without an isbn to ask about", () => {
    const { result } = render(null);

    expect(result.current.isAnswering).toBe(false);
    expect(mockedLoanDecision).toHaveBeenCalledWith(null, {
      enabled: false
    });
  });

  it("Reports nothing until Biblio has answered", () => {
    const { result } = render();

    expect(result.current.isAvailable).toBeNull();
  });

  it("Reads availability from the material, not from the user", () => {
    // A spent quota describes the user; the material itself is still there.
    givenAdapterAnswers("monthly_limit_exceeded");

    expect(render().result.current.isAvailable).toBe(true);
  });

  it("Counts a material that can only be reserved as unavailable", () => {
    givenAdapterAnswers("reservable");

    expect(render().result.current.isAvailable).toBe(false);
  });

  it("Counts a loanable material as available", () => {
    givenAdapterAnswers("loanable");

    expect(render().result.current.isAvailable).toBe(true);
  });

  describe("TEMPORARY: materials the adapter does not know", () => {
    // Goes with ServiceLayerConfig's toleration setting when the catalogue
    // and the adapter agree on which materials exist. Whether a 404 is
    // tolerated is the service layer's own business now; this hook only has
    // to read the tolerated answer correctly.
    it("Counts a tolerated unknown material as unavailable", () => {
      // The tolerated 404: the query resolved, and Biblio has no answer.
      mockedLoanDecision.mockReturnValue({
        data: null,
        isLoading: false
      } as unknown as ReturnType<typeof useDigitalLoanDecision>);

      const { result } = render();

      // Unavailable rather than an error - and never a fallback to Publizon:
      // with the flag on, a material Biblio cannot lend is not on offer.
      expect(result.current.isAvailable).toBe(false);
    });
  });
});
