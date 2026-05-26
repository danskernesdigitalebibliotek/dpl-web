import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import StatusSection from "../../apps/patron-page/sections/StatusSection";
import {
  useGetV1LibraryProfile,
  useGetV1UserLoans
} from "../../core/publizon/publizon";
import { FileExtensionType } from "../../core/publizon/model";

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

describe("StatusSection component tests", () => {
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
});
