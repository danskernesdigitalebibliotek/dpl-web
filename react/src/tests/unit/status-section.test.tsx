import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import StatusSection from "../../apps/patron-page/sections/StatusSection";
import {
  useGetV1LibraryProfile,
  useGetV1UserLoans
} from "../../core/publizon/publizon";
import { FileExtensionType } from "../../core/publizon/model";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { useBiblioLoanQuotas } from "@danskernesdigitalebibliotek/dpl-service-layer";

// Only the hooks under test are stubbed; the rest of the package stays
// real, so pure helpers keep behaving as they do in production.
vi.mock(
  "@danskernesdigitalebibliotek/dpl-service-layer",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@danskernesdigitalebibliotek/dpl-service-layer")
    >()),
    useBiblioLoanQuotas: vi.fn()
  })
);

// Mock the translation hook with some dummy translations and placeholder formatting
vi.mock("../../core/utils/text", () => {
  const TRANSLATIONS: Record<string, string> = {
    patronPageStatusSectionHeaderText: "Status",
    patronPageStatusSectionBodyText: "Her kan du se din status...",
    patronPageStatusSectionReservationsText:
      "Du kan reservere op til @countEbooks e-bøger og @countAudiobooks lydbøger.",
    patronPageStatusSectionLoanHeaderText: "Dine lån",
    patronPageStatusSectionLoansEbooksText: "E-bøger",
    patronPageStatusSectionOutOfText: "@this ud af @that",
    patronPageStatusSectionOutOfAriaLabelEbooksText:
      "@this ud af @that e-bøger lånt",
    patronPageStatusSectionLoansAudioBooksText: "Lydbøger",
    patronPageStatusSectionOutOfAriaLabelAudioBooksText:
      "@this ud af @that lydbøger lånt"
  };
  return {
    useText:
      () =>
      (key: string, options?: { placeholders?: Record<string, unknown> }) => {
        let result = TRANSLATIONS[key] || key;
        if (options?.placeholders) {
          for (const [placeholder, value] of Object.entries(
            options.placeholders
          )) {
            result = result.replace(
              new RegExp(placeholder, "g"),
              String(value)
            );
          }
        }
        return result;
      }
  };
});

// Mock the publizon hooks
vi.mock("../../core/publizon/publizon", () => ({
  useGetV1LibraryProfile: vi.fn(),
  useGetV1UserLoans: vi.fn()
}));

// Mock the Biblio adapter hooks. The feature flag reads app config through
// Redux, and the quota hook is a TanStack query, so neither can run without
// their providers here.
vi.mock("../../core/utils/useBiblioAdapter", () => ({
  default: vi.fn()
}));

describe("StatusSection component tests", () => {
  beforeEach(() => {
    // Default to the flag being off: Publizon answers, as before.
    vi.mocked(useBiblioAdapter).mockReturnValue(false);
    vi.mocked(useBiblioLoanQuotas).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof useBiblioLoanQuotas>);
  });
  it("should render nothing if library profile is not loaded", () => {
    vi.mocked(useGetV1LibraryProfile).mockReturnValue({
      data: null
    } as unknown as ReturnType<typeof useGetV1LibraryProfile>);
    vi.mocked(useGetV1UserLoans).mockReturnValue({
      isSuccess: false,
      data: undefined
    } as unknown as ReturnType<typeof useGetV1UserLoans>);

    const { container } = render(<StatusSection />);
    const section = container.querySelector(".dpl-status-loans");
    expect(section).not.toBeNull();
    // It should not render any details inside the section wrapper if profile is null
    expect(container.querySelector(".text-header-h4")).toBeNull();
  });

  it("should calculate and render correct progress percentages and text details without subscription loans", () => {
    vi.mocked(useGetV1LibraryProfile).mockReturnValue({
      data: {
        maxConcurrentEbookLoansPerBorrower: 10,
        maxConcurrentAudioLoansPerBorrower: 8,
        maxConcurrentEbookReservationsPerBorrower: 5,
        maxConcurrentAudioReservationsPerBorrower: 4
      }
    } as unknown as ReturnType<typeof useGetV1LibraryProfile>);

    vi.mocked(useGetV1UserLoans).mockReturnValue({
      isSuccess: true,
      data: {
        userData: {
          totalEbookLoans: 4,
          totalAudioLoans: 2
        },
        loans: [] // No loans (so no subscription loans to subtract)
      }
    } as unknown as ReturnType<typeof useGetV1UserLoans>);

    const { getByText, getByLabelText } = render(<StatusSection />);

    // Check header and reservations texts
    expect(getByText("Status")).not.toBeNull();
    expect(getByText("Her kan du se din status...")).not.toBeNull();
    expect(
      getByText("Du kan reservere op til 5 e-bøger og 4 lydbøger.")
    ).not.toBeNull();

    // Check Ebook section: 4 active loans out of 10 limit -> 40%
    expect(getByText("4 ud af 10")).not.toBeNull();
    const ebookProgressBar = getByLabelText("4 ud af 10 e-bøger lånt");
    expect(ebookProgressBar).not.toBeNull();
    expect(ebookProgressBar.getAttribute("style")).toBe("width: 40%;");

    // Check Audiobook section: 2 active loans out of 8 limit -> 25%
    expect(getByText("2 ud af 8")).not.toBeNull();
    const audiobookProgressBar = getByLabelText("2 ud af 8 lydbøger lånt");
    expect(audiobookProgressBar).not.toBeNull();
    expect(audiobookProgressBar.getAttribute("style")).toBe("width: 25%;");
  });

  it("should correctly deduct subscription loans from active loans count (quota fudging)", () => {
    vi.mocked(useGetV1LibraryProfile).mockReturnValue({
      data: {
        maxConcurrentEbookLoansPerBorrower: 5,
        maxConcurrentAudioLoansPerBorrower: 5,
        maxConcurrentEbookReservationsPerBorrower: 2,
        maxConcurrentAudioReservationsPerBorrower: 2
      }
    } as unknown as ReturnType<typeof useGetV1LibraryProfile>);

    vi.mocked(useGetV1UserLoans).mockReturnValue({
      isSuccess: true,
      data: {
        userData: {
          totalEbookLoans: 4,
          totalAudioLoans: 3
        },
        loans: [
          // 2 subscription ebook loans (FileExtensionType 2 and 3)
          {
            isSubscriptionLoan: true,
            fileExtensionType: FileExtensionType.NUMBER_2
          },
          {
            isSubscriptionLoan: true,
            fileExtensionType: FileExtensionType.NUMBER_3
          },
          // 1 normal ebook loan (should NOT be deducted)
          {
            isSubscriptionLoan: false,
            fileExtensionType: FileExtensionType.NUMBER_2
          },
          // 1 subscription audiobook loan (FileExtensionType 1)
          {
            isSubscriptionLoan: true,
            fileExtensionType: FileExtensionType.NUMBER_1
          },
          // 1 subscription loan that is neither ebook nor audiobook (should NOT be deducted)
          {
            isSubscriptionLoan: true,
            fileExtensionType: 99 as unknown as FileExtensionType
          }
        ]
      }
    } as unknown as ReturnType<typeof useGetV1UserLoans>);

    const { getAllByText, getByLabelText } = render(<StatusSection />);

    // Calculations:
    // Ebooks: total 4 - 2 subscription = 2 active. Limit is 5. Width = 40%.
    const outOfTexts = getAllByText("2 ud af 5");
    expect(outOfTexts.length).toBe(2);

    const ebookProgressBar = getByLabelText("2 ud af 5 e-bøger lånt");
    expect(ebookProgressBar).not.toBeNull();
    expect(ebookProgressBar.getAttribute("style")).toBe("width: 40%;");

    // Audiobooks: total 3 - 1 subscription = 2 active. Limit is 5. Width = 40%.
    const audiobookProgressBar = getByLabelText("2 ud af 5 lydbøger lånt");
    expect(audiobookProgressBar).not.toBeNull();
    expect(audiobookProgressBar.getAttribute("style")).toBe("width: 40%;");
  });

  it("should handle boundary/zero cases and default to 100% width if quota limit is 0", () => {
    vi.mocked(useGetV1LibraryProfile).mockReturnValue({
      data: {
        maxConcurrentEbookLoansPerBorrower: 0,
        maxConcurrentAudioLoansPerBorrower: 0,
        maxConcurrentEbookReservationsPerBorrower: 0,
        maxConcurrentAudioReservationsPerBorrower: 0
      }
    } as unknown as ReturnType<typeof useGetV1LibraryProfile>);

    vi.mocked(useGetV1UserLoans).mockReturnValue({
      isSuccess: true,
      data: {
        userData: {
          totalEbookLoans: 2,
          totalAudioLoans: 1
        },
        loans: []
      }
    } as unknown as ReturnType<typeof useGetV1UserLoans>);

    const { container } = render(<StatusSection />);

    // Since the limit is 0, maxConcurrentEbookLoansPerBorrower/maxConcurrentAudioLoansPerBorrower is 0 (falsy)
    // Percent defaults to 100%
    const progressBars = container.querySelectorAll(
      ".dpl-progress-bar__progress-bar div"
    );
    expect(progressBars.length).toBe(2);
    expect(progressBars[0].getAttribute("style")).toBe("width: 100%;");
    expect(progressBars[1].getAttribute("style")).toBe("width: 100%;");
  });

  describe("with the Biblio adapter feature flag on", () => {
    beforeEach(() => {
      vi.mocked(useBiblioAdapter).mockReturnValue(true);
      // Publizon is not asked at all when the flag is on.
      vi.mocked(useGetV1LibraryProfile).mockReturnValue({
        data: null
      } as unknown as ReturnType<typeof useGetV1LibraryProfile>);
      vi.mocked(useGetV1UserLoans).mockReturnValue({
        isSuccess: false,
        data: undefined
      } as unknown as ReturnType<typeof useGetV1UserLoans>);
    });

    it("Renders the quotas from Biblio, counting the loans held right now", () => {
      vi.mocked(useBiblioLoanQuotas).mockReturnValue({
        data: [
          {
            splitOnFormat: true,
            orgId: "org-1",
            orgName: "Eksempel Biblioteket",
            maxLoans: { ebook: 10, audiobook: 10 },
            maxConcurrentLoans: { ebook: 4, audiobook: 2 },
            currentConcurrentLoans: { ebook: 1, audiobook: 1 },
            // The monthly counters must NOT be the ones shown here.
            currentMonthlyLoans: { ebook: 7, audiobook: 6 }
          }
        ]
      } as unknown as ReturnType<typeof useBiblioLoanQuotas>);

      const { container } = render(<StatusSection />);

      expect(container.textContent).toContain("1 ud af 4");
      expect(container.textContent).toContain("1 ud af 2");
      expect(container.textContent).not.toContain("7 ud af");

      const progressBars = container.querySelectorAll(
        ".dpl-progress-bar__progress-bar div"
      );
      expect(progressBars[0].getAttribute("style")).toBe("width: 25%;");
      expect(progressBars[1].getAttribute("style")).toBe("width: 50%;");
    });

    it("Leaves out the reservation limits, which Biblio does not provide", () => {
      vi.mocked(useBiblioLoanQuotas).mockReturnValue({
        data: [
          {
            splitOnFormat: false,
            orgId: "org-2",
            orgName: "Eksempel Biblioteket",
            maxLoans: 10,
            maxConcurrentLoans: 4,
            currentConcurrentLoans: 2,
            currentMonthlyLoans: 6
          }
        ]
      } as unknown as ReturnType<typeof useBiblioLoanQuotas>);

      const { container } = render(<StatusSection />);

      // Rendering the line would claim the user can reserve zero materials.
      expect(container.textContent).not.toContain("Du kan reservere op til");
      // A combined quota applies the same numbers to both formats.
      expect(container.textContent).toContain("2 ud af 4");
    });

    it("Renders nothing until the quotas have loaded", () => {
      vi.mocked(useBiblioLoanQuotas).mockReturnValue({
        data: undefined
      } as unknown as ReturnType<typeof useBiblioLoanQuotas>);

      const { container } = render(<StatusSection />);

      expect(container.querySelector("h2")).toBeNull();
    });
  });
});
