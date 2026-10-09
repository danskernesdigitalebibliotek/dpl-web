import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Loans, reservations and loan quotas belong to a patron. Without a `user`
 * token - an anonymous visitor, or a Unilogin student logged in to Drupal -
 * none of them may be requested from FBS or Publizon. The service layer gates
 * its patron queries itself (isPatronAuthenticated).
 */

vi.mock("../../core/fbs/fbs", () => ({
  useGetLoansV2: vi.fn(() => ({})),
  useGetReservationsV2: vi.fn(() => ({}))
}));

vi.mock("../../core/publizon/publizon", () => ({
  useGetV1UserLoans: vi.fn(() => ({})),
  useGetV1UserReservations: vi.fn(() => ({})),
  useGetV1LibraryProfile: vi.fn(() => ({}))
}));

vi.mock("@danskernesdigitalebibliotek/dpl-service-layer", () => ({
  useDigitalLoans: vi.fn(() => ({})),
  useDigitalReservations: vi.fn(() => ({})),
  useDigitalQuotas: vi.fn(() => ({
    loanQuotas: { data: undefined },
    reservationLimits: { data: undefined }
  })),
  getDigitalLoanQuota: vi.fn(() => undefined)
}));

vi.mock("../../core/utils/useBiblioAdapter", () => ({
  default: vi.fn(() => false)
}));

vi.mock("../../core/utils/useLoanThresholds", () => ({
  default: vi.fn(() => ({ warning: 0, danger: 0 }))
}));

vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) => key
}));

vi.mock("../../core/utils/url", () => ({
  useUrls: () => () => new URL("https://example.dk/search")
}));

// The token store is module state, so every test starts from a fresh copy -
// as a fresh page load does.
const loadModules = async () => ({
  token: await import("../../core/token"),
  fbs: await import("../../core/fbs/fbs"),
  publizon: await import("../../core/publizon/publizon"),
  useLoans: (await import("../../core/utils/useLoans")).default,
  useReservations: (await import("../../core/utils/useReservations")).default,
  StatusSection: (await import("../../apps/patron-page/sections/StatusSection"))
    .default
});

type Modules = Awaited<ReturnType<typeof loadModules>>;

// Every patron query the hooks make, with the `enabled` flag it was given.
const enabledFlags = ({ fbs, publizon }: Modules) => ({
  fbsLoans: vi.mocked(fbs.useGetLoansV2).mock.lastCall?.[0]?.query?.enabled,
  fbsReservations: vi.mocked(fbs.useGetReservationsV2).mock.lastCall?.[0]?.query
    ?.enabled,
  publizonLoans: vi.mocked(publizon.useGetV1UserLoans).mock.lastCall?.[1]?.query
    ?.enabled,
  publizonReservations: vi.mocked(publizon.useGetV1UserReservations).mock
    .lastCall?.[0]?.query?.enabled
});

describe("patron queries", () => {
  let modules: Modules;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    modules = await loadModules();
    modules.token.setToken(modules.token.TOKEN_LIBRARY_KEY, "library-token");
  });

  it("are not made without a user token", () => {
    modules.useLoans();
    modules.useReservations();

    expect(enabledFlags(modules)).toEqual({
      fbsLoans: false,
      fbsReservations: false,
      publizonLoans: false,
      publizonReservations: false
    });
  });

  it("do not load loan quotas on the patron page without a user token", () => {
    modules.StatusSection({});

    expect(
      vi.mocked(modules.publizon.useGetV1UserLoans).mock.lastCall?.[1]?.query
        ?.enabled
    ).toBe(false);
  });

  // Guards against the tests above passing for the wrong reason.
  it("are made for a patron", () => {
    modules.token.setToken(modules.token.TOKEN_USER_KEY, "user-token");

    modules.useLoans();
    modules.useReservations();
    modules.StatusSection({});

    expect(enabledFlags(modules)).toEqual({
      fbsLoans: true,
      fbsReservations: true,
      publizonLoans: true,
      publizonReservations: true
    });
  });
});
