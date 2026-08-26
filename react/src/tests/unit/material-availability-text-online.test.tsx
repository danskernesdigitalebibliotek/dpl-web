import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import MaterialAvailabilityTextOnline from "../../components/material/MaterialAvailabilityText/online/MaterialAvailabilityTextOnline";
import {
  useGetV1LibraryProfile,
  useGetV1ProductsIdentifier,
  useGetV1UserLoans
} from "../../core/publizon/publizon";
import useServiceLayerLending from "../../core/utils/useServiceLayerLending";
import {
  useLoanDecision,
  useDigitalLoanQuotas
} from "@danskernesdigitalebibliotek/dpl-service-layer";

// Only the hooks under test are stubbed; the rest of the package stays
// real, so pure helpers keep behaving as they do in production.
vi.mock(
  "@danskernesdigitalebibliotek/dpl-service-layer",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@danskernesdigitalebibliotek/dpl-service-layer")
    >()),
    useLoanDecision: vi.fn(),
    useDigitalLoanQuotas: vi.fn()
  })
);

/**
 * The quota line under an online material - "you have borrowed X of Y
 * e-books this month".
 *
 * The numbers come from the service the user is actually borrowing against.
 * Once a library has enabled the adapter that is the adapter, so Publizon's
 * limits must not surface: they would describe a quota the user is no longer
 * spending.
 */

const ISBN = "9788727319346";

vi.mock("../../core/utils/text", () => ({
  useText:
    () =>
    (key: string, options?: { placeholders?: Record<string, unknown> }) => {
      const translations: Record<string, string> = {
        onlineLimitMonthEbookInfoText: "You have borrowed @count of @limit",
        materialIsIncludedText: "This material is included"
      };
      let result = translations[key] || key;
      if (options?.placeholders) {
        Object.entries(options.placeholders).forEach(([placeholder, value]) => {
          result = result.replace(new RegExp(placeholder, "g"), String(value));
        });
      }
      return result;
    }
}));

vi.mock("../../core/publizon/publizon", () => ({
  useGetV1LibraryProfile: vi.fn(),
  useGetV1ProductsIdentifier: vi.fn(),
  useGetV1UserLoans: vi.fn()
}));

vi.mock("../../core/utils/helpers/user", () => ({ isAnonymous: () => false }));
vi.mock("../../core/utils/useServiceLayerLending", () => ({
  default: vi.fn()
}));
// TEMPORARY toleration flag; reads config from Redux, which these renders
// have no provider for. Off keeps the strict default under test.
vi.mock("../../core/digital/useTolerateUnknownMaterials", () => ({
  default: () => false
}));

const publizonSays = (quotas: {
  limit: number | undefined;
  borrowed: number;
  costFree?: boolean;
}) => {
  vi.mocked(useGetV1ProductsIdentifier).mockReturnValue({
    data: { product: { costFree: quotas.costFree ?? false } }
  } as unknown as ReturnType<typeof useGetV1ProductsIdentifier>);
  vi.mocked(useGetV1LibraryProfile).mockReturnValue({
    data: { maxConcurrentEbookLoansPerBorrower: quotas.limit }
  } as unknown as ReturnType<typeof useGetV1LibraryProfile>);
  vi.mocked(useGetV1UserLoans).mockReturnValue({
    data: { userData: { totalEbookLoans: quotas.borrowed }, loans: [] }
  } as unknown as ReturnType<typeof useGetV1UserLoans>);
};

const renderText = () =>
  render(
    <MaterialAvailabilityTextOnline
      isbns={[ISBN]}
      materialType={"e-bog" as never}
    />
  );

describe("MaterialAvailabilityTextOnline", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useDigitalLoanQuotas).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof useDigitalLoanQuotas>);
    vi.mocked(useLoanDecision).mockReturnValue({
      data: undefined
    } as unknown as ReturnType<typeof useLoanDecision>);
  });

  describe("with the feature flag off", () => {
    beforeEach(() => {
      vi.mocked(useServiceLayerLending).mockReturnValue(false);
    });

    it("Shows Publizon's quota", () => {
      publizonSays({ limit: 7, borrowed: 2 });

      expect(renderText().container.textContent).toContain(
        "You have borrowed 2 of 7"
      );
    });

    it("Says the material is included when it is cost free", () => {
      publizonSays({ limit: 7, borrowed: 2, costFree: true });

      expect(renderText().container.textContent).toContain(
        "This material is included"
      );
    });
  });

  describe("with the feature flag on", () => {
    beforeEach(() => {
      vi.mocked(useServiceLayerLending).mockReturnValue(true);
    });

    const biblioLends = (loanProvider?: string) =>
      vi.mocked(useLoanDecision).mockReturnValue({
        data: { status: "loanable", loanProvider }
      } as unknown as ReturnType<typeof useLoanDecision>);

    it("Says the material is included when it is lent as a blue title", () => {
      // "selection" is the licence Danish blue titles answer with - WeDoBooks
      // states those are bought out and draw on no quota.
      biblioLends("selection");

      expect(renderText().container.textContent).toContain(
        "This material is included"
      );
    });

    it.each(["click", "package", "premium", "k-fond", "free"])(
      "Counts a %s loan against the quota rather than calling it included",
      (loanProvider) => {
        // These are ways the library pays, and the loan still uses one of
        // the patron's own. "free" stays among them on purpose: it is not in
        // use, and all WeDoBooks has confirmed is that it will be exempt from
        // the quotas - not that it is free to the patron, which is what this
        // text promises.
        biblioLends(loanProvider);
        vi.mocked(useDigitalLoanQuotas).mockReturnValue({
          data: [
            {
              splitOnFormat: true,
              orgId: "org-1",
              orgName: "Eksempel Biblioteket",
              maxLoans: { ebook: 10, audiobook: 10 },
              maxConcurrentLoans: { ebook: 4, audiobook: 4 },
              currentConcurrentLoans: { ebook: 1, audiobook: 1 },
              currentMonthlyLoans: { ebook: 3, audiobook: 2 }
            }
          ]
        } as unknown as ReturnType<typeof useDigitalLoanQuotas>);

        const text = renderText().container.textContent;

        expect(text).not.toContain("This material is included");
        expect(text).toContain("You have borrowed 3 of 10");
      }
    );

    it("Promises nothing when Biblio picked no provider at all", () => {
      // loan_provider is optional by contract: absent means no licence could
      // be selected, which is not the same as a free one.
      biblioLends(undefined);

      expect(renderText().container.textContent).not.toContain(
        "This material is included"
      );
    });

    it("Shows Biblio's monthly quota", () => {
      vi.mocked(useDigitalLoanQuotas).mockReturnValue({
        data: [
          {
            splitOnFormat: true,
            orgId: "org-1",
            orgName: "Eksempel Biblioteket",
            maxLoans: { ebook: 10, audiobook: 10 },
            maxConcurrentLoans: { ebook: 4, audiobook: 4 },
            // The concurrent counters must NOT be the ones shown here - the
            // text talks about loans "this month".
            currentConcurrentLoans: { ebook: 1, audiobook: 1 },
            currentMonthlyLoans: { ebook: 3, audiobook: 2 }
          }
        ]
      } as unknown as ReturnType<typeof useDigitalLoanQuotas>);
      // Publizon knows nothing about a material that lives in Biblio.
      publizonSays({ limit: undefined, borrowed: 0 });
      vi.mocked(useGetV1ProductsIdentifier).mockReturnValue({
        data: undefined
      } as unknown as ReturnType<typeof useGetV1ProductsIdentifier>);

      expect(renderText().container.textContent).toContain(
        "You have borrowed 3 of 10"
      );
    });

    it("Never shows Publizon's limits, even when Publizon knows the material", () => {
      // The user is no longer borrowing against these, so showing them would
      // state a limit that does not apply.
      vi.mocked(useDigitalLoanQuotas).mockReturnValue({
        data: undefined
      } as unknown as ReturnType<typeof useDigitalLoanQuotas>);
      publizonSays({ limit: 7, borrowed: 2 });

      expect(renderText().container.textContent).not.toContain(
        "You have borrowed 2 of 7"
      );
    });
  });
});
