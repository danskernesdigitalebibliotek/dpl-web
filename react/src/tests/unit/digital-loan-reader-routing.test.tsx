import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import type { Loan } from "../../core/publizon/model";
import type { DigitalLoan } from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  mapDigitalLoanToLoanType,
  mapPublizonLoanToLoanType
} from "../../core/utils/helpers/list-mapper";
import {
  playerUrl,
  readerUrl,
  sampleUrl
} from "../../components/reader-player/helper";
import DigitalReaderPlayer from "../../components/reader-player/DigitalReaderPlayer";
import useReaderCheckout from "../../components/reader-player/useReaderCheckout";

// The reader and player themselves need the SDK; which of them mounts is the
// decision under test, so they are reduced to markers.
vi.mock("../../components/reader-player/DigitalReader", () => ({
  default: () => <div data-testid="reader" />
}));
vi.mock("../../components/reader-player/DigitalPlayer", () => ({
  default: () => <div data-testid="player" />
}));
vi.mock("../../components/reader-player/useReaderCheckout", () => ({
  default: vi.fn()
}));

const givenCheckout = (materialType: string | null) =>
  vi.mocked(useReaderCheckout).mockReturnValue({
    sdk: {},
    checkout: materialType ? { material_type: materialType } : null
  } as unknown as ReturnType<typeof useReaderCheckout>);
import { store } from "../../core/store";
import { addTextEntries } from "../../core/text.slice";

/**
 * A patron whose library has switched to Biblio still holds Publizon loans
 * until those expire, so the loan list mixes both. Each has to open in the
 * reader belonging to the service that issued it - Publizon's knows an order
 * id, WeDoBooks' a loan id, and neither recognises the other's.
 *
 * Nothing about the two ids distinguishes them by shape, so the loan has to
 * carry the answer. These tests pin that it does.
 */

const publizonLoan = {
  orderId: "082bb01a-8979-424b-93a6-7cc7081f8a45",
  orderDateUtc: "2022-10-19T08:15:00.000Z",
  loanExpireDateUtc: "2022-11-16T08:15:00.000Z",
  libraryBook: { identifier: "9788727319346" }
} as Loan;

const digitalLoan: DigitalLoan = {
  loanId: "VAcPZZkCeqvnNRnOdP17",
  materialId: "9788758855769",
  materialType: "audiobook",
  startDate: "2022-10-19T08:15:00.000Z",
  endDate: "2022-11-16T08:15:00.000Z",
  active: true,
  title: "Større end os",
  author: "Sherman, L.",
  publisher: "Lindhardt og Ringhof",
  publishDate: "2022-06-18T00:00:00.000Z",
  loanProvider: "selection"
};

describe("Which reader a digital loan opens in", () => {
  it("marks a Publizon loan as Publizon's to open", () => {
    const [loan] = mapPublizonLoanToLoanType([publizonLoan]);

    expect(loan.digitalProvider).toBe("publizon");
  });

  it("marks a Biblio loan as Biblio's to open", () => {
    store.dispatch(
      addTextEntries({
        publizonEbookText: "E-bog",
        publizonAudioBookText: "Lydbog"
      })
    );

    const [loan] = mapDigitalLoanToLoanType([digitalLoan]);

    expect(loan.digitalProvider).toBe("serviceLayer");
  });

  it("gives both providers the key their own reader opens the loan with", () => {
    store.dispatch(
      addTextEntries({
        publizonEbookText: "E-bog",
        publizonAudioBookText: "Lydbog"
      })
    );

    const [publizon] = mapPublizonLoanToLoanType([publizonLoan]);
    const [biblio] = mapDigitalLoanToLoanType([digitalLoan]);

    // Same field, different id: the order id for Publizon, the loan id for
    // Biblio. This is exactly why the provider has to be carried alongside it.
    expect(publizon.orderId).toBe(publizonLoan.orderId);
    expect(biblio.orderId).toBe(digitalLoan.loanId);
  });
});

describe("Where a digital material's url points", () => {
  // The /reader route reads one parameter per provider: pubhub expects an
  // order id, the WeDoBooks SDK a loan id.
  it("opens a Biblio loan by its loan id", () => {
    expect(readerUrl("VAcPZZkCeqvnNRnOdP17", "serviceLayer").search).toBe(
      "?loanid=VAcPZZkCeqvnNRnOdP17"
    );
  });

  it("opens a Publizon loan by its order id", () => {
    expect(readerUrl("082bb01a", "publizon").search).toBe("?orderid=082bb01a");
  });

  it("falls back to Publizon when the loan does not say", () => {
    // Loans mapped before digitalProvider existed - persisted state, older
    // callers - must keep opening where they always did.
    expect(readerUrl("082bb01a").search).toBe("?orderid=082bb01a");
  });

  it("plays a Biblio audiobook loan on the player page", () => {
    const url = playerUrl("VAcPZZkCeqvnNRnOdP17");

    expect(url.pathname).toBe("/player");
    expect(url.search).toBe("?loanid=VAcPZZkCeqvnNRnOdP17");
  });

  it("sends each sample to the page its material type plays on", () => {
    // The route carries the type: a sample has no loan to read it from.
    expect(sampleUrl("9788711623497", "ebook").pathname).toBe("/reader");
    expect(sampleUrl("9788711823453", "audiobook").pathname).toBe("/player");
    expect(sampleUrl("9788711823453", "audiobook").search).toBe(
      "?identifier=9788711823453"
    );
  });
});

describe("What a page opens a Biblio loan in", () => {
  // Both pages mount this component and are reached with nothing but a loan
  // id, so the loan's own material type is the only thing that can pick
  // reader vs player - a deep link opens the right thing no matter which
  // page it names.
  it("plays an audiobook in the player", () => {
    givenCheckout("audiobook");

    const { container } = render(
      <DigitalReaderPlayer loanId="loan-1" onClose={() => {}} />
    );

    expect(container.querySelector("[data-testid='player']")).not.toBeNull();
    expect(container.querySelector("[data-testid='reader']")).toBeNull();
  });

  it("reads an e-book in the reader", () => {
    givenCheckout("ebook");

    const { container } = render(
      <DigitalReaderPlayer loanId="loan-1" onClose={() => {}} />
    );

    expect(container.querySelector("[data-testid='reader']")).not.toBeNull();
    expect(container.querySelector("[data-testid='player']")).toBeNull();
  });

  it("opens nothing until the entitlement has answered", () => {
    givenCheckout(null);

    const { container } = render(
      <DigitalReaderPlayer loanId="loan-1" onClose={() => {}} />
    );

    expect(container.querySelector("[data-testid='reader']")).toBeNull();
    expect(container.querySelector("[data-testid='player']")).toBeNull();
  });
});
