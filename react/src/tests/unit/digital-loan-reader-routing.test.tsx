import { describe, expect, it } from "vitest";
import type { Loan } from "../../core/publizon/model";
import type { BiblioLoan } from "@danskernesdigitalebibliotek/dpl-service-layer";
import {
  mapBiblioLoanToLoanType,
  mapPublizonLoanToLoanType
} from "../../core/utils/helpers/list-mapper";
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

const biblioLoan: BiblioLoan = {
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

    const [loan] = mapBiblioLoanToLoanType([biblioLoan]);

    expect(loan.digitalProvider).toBe("biblio");
  });

  it("gives both providers the key their own reader opens the loan with", () => {
    store.dispatch(
      addTextEntries({
        publizonEbookText: "E-bog",
        publizonAudioBookText: "Lydbog"
      })
    );

    const [publizon] = mapPublizonLoanToLoanType([publizonLoan]);
    const [biblio] = mapBiblioLoanToLoanType([biblioLoan]);

    // Same field, different id: the order id for Publizon, the loan id for
    // Biblio. This is exactly why the provider has to be carried alongside it.
    expect(publizon.orderId).toBe(publizonLoan.orderId);
    expect(biblio.orderId).toBe(biblioLoan.loanId);
  });
});
