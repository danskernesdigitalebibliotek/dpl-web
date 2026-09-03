import { renderHook } from "@testing-library/react";
import {
  afterEach,
  beforeEach,
  beforeAll,
  describe,
  expect,
  it,
  vi
} from "vitest";
import { act } from "react";
import usePhysicalAvailabilityData from "../../components/availability-label/usePhysicalAvailabilityData";
import { useGetAvailabilityV3 } from "../../core/fbs/fbs";
import { ManifestationMaterialType } from "../../core/utils/types/material-type";
import { useConfig } from "../../core/utils/config";
import {
  useGetV1LoanstatusIdentifier,
  useGetV1ProductsIdentifier
} from "../../core/publizon/publizon";
import useOnlineAvailabilityData from "../../components/availability-label/useOnlineAvailabilityData";
import { useDigitalLoanDecision } from "@danskernesdigitalebibliotek/dpl-service-layer";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isAnonymous } from "../../core/utils/helpers/user";

describe("usePhysicalAvailability tests", () => {
  beforeAll(() => {
    vi.mock("../../core/fbs/fbs", () => ({
      useGetAvailabilityV3: vi.fn()
    }));
    vi.mock("../../core/utils/config", () => ({
      useConfig: vi.fn()
    }));

    // Make sure that the config hook returns an array with an empty string.
    // In that way we do not have any blacklisted branches (they are not needed for the test).
    // Typescript does not understand our mocked hook.
    // So we gracefully ignore the error :).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useConfig.mockReturnValue(() => [""]);
  });

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Test that if one material is a book and is available, the hook returns that the material is available", () => {
    // Typescript does not understand our mocked hook.
    // So we gracefully ignore the error :).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetAvailabilityV3.mockReturnValue({
      data: [
        {
          recordId: "24859451",
          reservable: true,
          available: true,
          reservations: 0
        },
        {
          recordId: "24859450",
          reservable: true,
          available: false,
          reservations: 0
        }
      ],
      isLoading: false,
      isError: false
    });

    const { result } = renderHook(() =>
      usePhysicalAvailabilityData({
        enabled: true,
        faustIds: ["24859452"],
        manifestText: "bog"
      })
    );

    act(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isAvailable: true
      });
    });
  });

  it("Test that if the material is a book amd no material is available the hook returns that it is unavailable", async () => {
    // Typescript does not understand our mocked hook.
    // So we gracefully ignore the error :).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetAvailabilityV3.mockReturnValue({
      data: [
        {
          recordId: "24859451",
          reservable: true,
          available: false,
          reservations: 0
        },
        {
          recordId: "24859450",
          reservable: true,
          available: false,
          reservations: 0
        }
      ],
      isLoading: false,
      isError: false
    });

    const { result } = renderHook(() =>
      usePhysicalAvailabilityData({
        enabled: true,
        faustIds: ["24859452"],
        manifestText: "bog"
      })
    );

    act(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isAvailable: false
      });
    });
  });

  it("Test that if the material is an article it will always be available even though the remote service tells otherwise", () => {
    // Typescript does not understand our mocked hook.
    // So we gracefully ignore the error :).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetAvailabilityV3.mockReturnValue({
      data: [
        {
          recordId: "24859451",
          reservable: true,
          available: false,
          reservations: 0
        },
        {
          recordId: "24859450",
          reservable: true,
          available: false,
          reservations: 0
        }
      ],
      isLoading: false,
      isError: false
    });

    const { result } = renderHook(() =>
      usePhysicalAvailabilityData({
        enabled: true,
        faustIds: ["24859452"],
        manifestText: ManifestationMaterialType.article
      })
    );

    act(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isAvailable: true
      });
    });
  });

  it("Test that if the material is an article it will always be available even though the remote service tells otherwise", () => {
    // Typescript does not understand our mocked hook.
    // So we gracefully ignore the error :).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetAvailabilityV3.mockReturnValue({
      data: [
        {
          recordId: "24859451",
          reservable: true,
          available: false,
          reservations: 0
        },
        {
          recordId: "24859450",
          reservable: true,
          available: false,
          reservations: 0
        }
      ],
      isLoading: false,
      isError: false
    });

    const { result } = renderHook(() =>
      usePhysicalAvailabilityData({
        enabled: true,
        faustIds: ["24859452"],
        manifestText: ManifestationMaterialType.article
      })
    );

    act(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isAvailable: true
      });
    });
  });

  it("Test that if the hook is not enabled it should return null statuses", () => {
    // Typescript does not understand our mocked hook.
    // So we gracefully ignore the error :).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetAvailabilityV3.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false
    });

    const { result } = renderHook(() =>
      usePhysicalAvailabilityData({
        enabled: false,
        faustIds: ["24859452"],
        manifestText: ManifestationMaterialType.article
      })
    );

    act(() => {
      expect(result.current).toEqual({
        isLoading: null,
        isAvailable: null
      });
    });
  });
});

describe("useOnlineAvailabilityData tests", () => {
  beforeAll(() => {
    vi.mock("../../core/publizon/publizon", async () => {
      const actual =
        (await vi.importActual("../../core/publizon/publizon")) ?? {};
      return {
        // No need for the ts check here.
        // We want to partially mock the module and this is the way to do it.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        ...actual,
        useGetV1ProductsIdentifier: vi.fn(),
        useGetV1LoanstatusIdentifier: vi.fn()
      };
    });

    // Only the query is stubbed. isMaterialAvailable stays real - it is the
    // rule the hook is here to apply, and a copy of it in the test would
    // pass whatever the package does.
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
    vi.mock("../../core/utils/helpers/user", async (importOriginal) => ({
      ...(await importOriginal<
        typeof import("../../core/utils/helpers/user")
      >()),
      isAnonymous: vi.fn()
    }));
  });

  const mockedLoanDecision = vi.mocked(useDigitalLoanDecision);
  const mockedFlag = vi.mocked(useBiblioAdapter);
  const mockedIsAnonymous = vi.mocked(isAnonymous);

  const ISBN = "9788794564076";

  const givenBiblioAnswers = (status: string) =>
    mockedLoanDecision.mockReturnValue({
      data: { status },
      isLoading: false
    } as unknown as ReturnType<typeof useDigitalLoanDecision>);

  const render = (isbn: string | null = ISBN, enabled = true) =>
    renderHook(() =>
      useOnlineAvailabilityData({ enabled, access: ["Ereol"], isbn })
    );

  beforeEach(() => {
    vi.useFakeTimers();
    // Without this, a "was it called with X" assertion can match a call from
    // an earlier test in this block.
    vi.clearAllMocks();

    // Default to Biblio not being the lending provider, so Publizon
    // answers - a library that has not enabled the feature flag.
    mockedFlag.mockReturnValue(false);
    mockedIsAnonymous.mockReturnValue(false);
    mockedLoanDecision.mockReturnValue({
      data: undefined,
      isLoading: false
    } as unknown as ReturnType<typeof useDigitalLoanDecision>);
    // Publizon knows nothing until a test says otherwise.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1ProductsIdentifier.mockReturnValue({
      isLoading: false,
      data: undefined
    });
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1LoanstatusIdentifier.mockReturnValue({
      isLoading: false,
      data: undefined
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("If the useGetV1ProductsIdentifier service tells us that the material is NOT `costFree` (not a blue title) and the material belongs to 'Ereol' (the access param) the Publizon product status should dictate the availability ", () => {
    // The only Publizon product status that is NOT available is 5.

    // Typescript does not understand our mocked hooks.
    // So we gracefully ignore the errors:).
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1ProductsIdentifier.mockReturnValue({
      isLoading: false,
      data: {
        product: {
          costFree: false
        }
      }
    });

    /**
     * First test:
     * Publizon product status: 4
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1LoanstatusIdentifier.mockReturnValue({
      isLoading: false,
      data: {
        loanStatus: 4
      }
    });

    const { result: firstResult } = render();

    act(() => {
      expect(firstResult.current).toEqual({
        isLoading: false,
        isAvailable: true
      });
    });
    /**
     * End first test.
     */

    /**
     * Second test:
     * Publizon product status: 5
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1LoanstatusIdentifier.mockReturnValue({
      isLoading: false,
      data: {
        loanStatus: 5
      }
    });
    const { result: secondResult } = render();

    act(() => {
      expect(secondResult.current).toEqual({
        isLoading: false,
        isAvailable: false
      });
    });
    /**
     * End second test.
     */

    /**
     * Third test:
     * Publizon product status: 2
     */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1LoanstatusIdentifier.mockReturnValue({
      isLoading: false,
      data: {
        loanStatus: 2
      }
    });
    const { result: thirdResult } = render();

    act(() => {
      expect(thirdResult.current).toEqual({
        isLoading: false,
        isAvailable: true
      });
    });
    /**
     * End third test.
     */
  });

  it("Test that if the material is cost free nothing else matters", () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    useGetV1ProductsIdentifier.mockReturnValue({
      isLoading: false,
      data: {
        product: {
          costFree: true
        }
      }
    });

    const { result } = render();

    act(() => {
      expect(result.current).toEqual({
        isLoading: false,
        isAvailable: true
      });
    });
  });

  it("Test that if the hook is not enabled it should return null statuses", () => {
    const { result } = render(ISBN, false);

    act(() => {
      expect(result.current).toEqual({
        isLoading: null,
        isAvailable: null
      });
    });
  });

  it("Asks no provider about an online material outside the e-book service", () => {
    // A PressReader newspaper is online, but reached through a plain url and
    // not part of the e-book service - neither Publizon nor Biblio knows it,
    // so neither should be asked. Even with the library switched to Biblio.
    mockedFlag.mockReturnValue(true);

    renderHook(() =>
      useOnlineAvailabilityData({
        enabled: true,
        access: ["AccessUrl"],
        isbn: ISBN
      })
    );

    expect(mockedLoanDecision).toHaveBeenCalledWith(ISBN, { enabled: false });
    expect(useGetV1ProductsIdentifier).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ query: { enabled: false } })
    );
  });

  it("Leaves Biblio alone at a library that has not switched", () => {
    // The flag defaults to off in this block. Biblio is not merely ignored -
    // the query is disabled, so nothing is asked of an adapter the library
    // has not opted in to, and Publizon keeps answering.
    render();

    expect(mockedLoanDecision).toHaveBeenCalledWith(ISBN, { enabled: false });
    expect(useGetV1ProductsIdentifier).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ query: { enabled: true } })
    );
  });

  describe("once the library has switched to Biblio", () => {
    beforeEach(() => {
      mockedFlag.mockReturnValue(true);
    });

    it("Asks Biblio about the material", () => {
      render();

      expect(mockedLoanDecision).toHaveBeenCalledWith(ISBN, {
        enabled: true
      });
    });

    it("Leaves Biblio alone without an isbn to ask about", () => {
      render(null);

      // The query is still declared - hooks cannot be conditional - but it
      // is disabled, so no request is made.
      expect(mockedLoanDecision).toHaveBeenCalledWith(null, {
        enabled: false
      });
    });

    it("Asks nobody for an anonymous visitor, who sees the material as available", () => {
      // can-loan is patron-scoped, so Biblio cannot be asked without a user -
      // and Publizon must not stand in for it, not even then. Online
      // materials default to available while nobody has answered.
      mockedIsAnonymous.mockReturnValue(true);

      const { result } = render();

      expect(mockedLoanDecision).toHaveBeenCalledWith(ISBN, {
        enabled: false
      });
      expect(useGetV1ProductsIdentifier).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ query: { enabled: false } })
      );
      expect(useGetV1LoanstatusIdentifier).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          query: expect.objectContaining({ enabled: false })
        })
      );
      expect(result.current.isAvailable).toBe(true);
    });

    it("Lets Biblio dictate the availability", () => {
      givenBiblioAnswers("reservable");

      const { result } = render();

      act(() => {
        expect(result.current.isAvailable).toBe(false);
      });
    });

    it("Reads availability from the material, not from the user", () => {
      // A spent quota describes the user; the material itself is still there.
      givenBiblioAnswers("monthly_limit_exceeded");

      expect(render().result.current.isAvailable).toBe(true);
    });

    it("Counts a loanable material as available", () => {
      givenBiblioAnswers("loanable");

      expect(render().result.current.isAvailable).toBe(true);
    });

    it("Keeps Publizon from answering at all", () => {
      // Publizon would report the material as unavailable (status 5), but
      // the library has switched provider, so its answer no longer applies
      // - not even one already sitting in the query cache.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore-next-line
      useGetV1LoanstatusIdentifier.mockReturnValue({
        isLoading: false,
        data: { loanStatus: 5 }
      });
      mockedLoanDecision.mockReturnValue({
        data: undefined,
        isLoading: true
      } as unknown as ReturnType<typeof useDigitalLoanDecision>);

      const { result } = render();

      act(() => {
        // Online materials default to available while the answer is unknown.
        // The loan attempt then fails visibly rather than going to Publizon.
        expect(result.current.isAvailable).toBe(true);
        // And the hook says the answer is still on its way.
        expect(result.current.isLoading).toBe(true);
      });
    });

    describe("TEMPORARY: materials the adapter does not know", () => {
      // Goes with ServiceLayerConfig's toleration setting when the catalogue
      // and the adapter agree on which materials exist. Whether a 404 is
      // tolerated is the service layer's own business now; this hook only
      // has to read the tolerated answer correctly.
      it("Counts a tolerated unknown material as unavailable", () => {
        // The tolerated 404: the query resolved, and Biblio has no answer.
        mockedLoanDecision.mockReturnValue({
          data: null,
          isLoading: false
        } as unknown as ReturnType<typeof useDigitalLoanDecision>);

        const { result } = render();

        // Unavailable rather than an error - and never a fallback to
        // Publizon: with the flag on, a material Biblio cannot lend is not
        // on offer.
        expect(result.current.isAvailable).toBe(false);
      });
    });
  });
});
