import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import useBiblioAvailability from "../../core/biblio/useBiblioAvailability";
import { useBiblioCanLoan } from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isAnonymous } from "../../core/utils/helpers/user";

// Only the query is stubbed. isBiblioMaterialAvailable stays real - it is the
// rule this hook is here to apply, and a copy of it in the test would pass
// whatever the package does.
vi.mock(
  "@danskernesdigitalebibliotek/dpl-service-layer",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@danskernesdigitalebibliotek/dpl-service-layer")
    >()),
    useBiblioCanLoan: vi.fn()
  })
);
vi.mock("../../core/utils/useBiblioAdapter", () => ({
  default: vi.fn()
}));
vi.mock("../../core/utils/helpers/user", () => ({ isAnonymous: vi.fn() }));

const mockedCanLoan = vi.mocked(useBiblioCanLoan);
const mockedFlag = vi.mocked(useBiblioAdapter);
const mockedIsAnonymous = vi.mocked(isAnonymous);

const ISBN = "9788727319346";

const givenAdapterAnswers = (status: string) =>
  mockedCanLoan.mockReturnValue({
    data: { status },
    isLoading: false
  } as unknown as ReturnType<typeof useBiblioCanLoan>);

const render = (isbn: string | null = ISBN, enabled = true) =>
  renderHook(() => useBiblioAvailability({ enabled, isbn }));

/**
 * The hook that decides availability for the materials Biblio provides. The
 * `useOnlineAvailabilityData` tests mock this away, so without these its own
 * gate and its reading of Biblio's status would be untested.
 */
describe("useBiblioAvailability", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedFlag.mockReturnValue(true);
    mockedIsAnonymous.mockReturnValue(false);
    mockedCanLoan.mockReturnValue({
      data: undefined,
      isLoading: false
    } as unknown as ReturnType<typeof useBiblioCanLoan>);
  });

  it("Answers for the material when the library has enabled the flag", () => {
    const { result } = render();

    expect(result.current.isAnswering).toBe(true);
    expect(mockedCanLoan).toHaveBeenCalledWith(ISBN, { enabled: true });
  });

  it("Leaves Biblio alone when the flag is off", () => {
    mockedFlag.mockReturnValue(false);

    const { result } = render();

    expect(result.current.isAnswering).toBe(false);
    // The query is still declared - hooks cannot be conditional - but it is
    // disabled, so no request is made.
    expect(mockedCanLoan).toHaveBeenCalledWith(ISBN, { enabled: false });
  });

  it("Leaves Biblio alone without an isbn to ask about", () => {
    const { result } = render(null);

    expect(result.current.isAnswering).toBe(false);
    expect(mockedCanLoan).toHaveBeenCalledWith(null, { enabled: false });
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
});
