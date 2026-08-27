import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import ReaderEntry from "../../apps/reader/Reader.entry";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { isAnonymous } from "../../core/utils/helpers/user";

/**
 * The reader page's routing for samples. An identifier link with no loan
 * behind it is a sample: with the adapter flag on it goes through WeDoBooks
 * and Publizon is never asked to stand in; only flag-off libraries keep
 * Publizon's sample. The link carries the material type, because a sample has
 * no loan to read it from.
 */

// What the page routes to is the decision under test, so every destination is
// reduced to a marker.
vi.mock("../../components/reader-player/PublizonReader", () => ({
  default: () => <div data-testid="publizon-reader" />
}));
vi.mock("../../components/reader-player/DigitalReaderPlayer", () => ({
  default: () => <div data-testid="biblio-loan" />
}));
vi.mock("../../components/reader-player/DigitalSampleReaderPlayer", () => ({
  default: ({ materialType }: { materialType: string }) => (
    <div data-testid={`biblio-sample-${materialType}`} />
  )
}));

// The entry's HOCs dispatch mount data into Redux; the routing needs none of
// it, so they are reduced to identity wrappers.
vi.mock("../../core/utils/config", () => ({
  withConfig: (component: unknown) => component
}));
vi.mock("../../core/utils/url", () => ({
  withUrls: (component: unknown) => component
}));
vi.mock("../../core/utils/text", () => ({
  withText: (component: unknown) => component
}));

vi.mock("../../core/utils/useBiblioAdapter", () => ({
  default: vi.fn()
}));
vi.mock("../../core/utils/helpers/user", () => ({ isAnonymous: vi.fn() }));

describe("Reader page sample routing", () => {
  beforeEach(() => {
    cleanup();
    vi.mocked(useBiblioAdapter).mockReturnValue(true);
    vi.mocked(isAnonymous).mockReturnValue(false);
  });

  it("Samples an e-book through WeDoBooks for a signed-in patron", () => {
    const { queryByTestId } = render(
      <ReaderEntry identifier="9788711623497" />
    );

    expect(queryByTestId("biblio-sample-ebook")).not.toBeNull();
  });

  it("Samples an audiobook when the link says so", () => {
    const { queryByTestId } = render(
      <ReaderEntry identifier="9788711823453" sampletype="audiobook" />
    );

    expect(queryByTestId("biblio-sample-audiobook")).not.toBeNull();
  });

  it("Never falls back to Publizon's sample while the flag is on", () => {
    // With the flag on, Biblio is the lending provider - an anonymous visitor
    // reaches this page only through a hand-made link, since the teaser
    // buttons are disabled for them, and even then Publizon is not asked.
    vi.mocked(isAnonymous).mockReturnValue(true);

    const { queryByTestId } = render(
      <ReaderEntry identifier="9788711623497" />
    );

    expect(queryByTestId("publizon-reader")).toBeNull();
  });

  it("Keeps Publizon's sample while the flag is off", () => {
    vi.mocked(useBiblioAdapter).mockReturnValue(false);

    const { queryByTestId } = render(
      <ReaderEntry identifier="9788711623497" />
    );

    expect(queryByTestId("publizon-reader")).not.toBeNull();
  });

  it("Opens a Publizon loan in Publizon's reader, never as a sample", () => {
    const { queryByTestId } = render(
      <ReaderEntry identifier="9788711623497" orderid="order-1" />
    );

    expect(queryByTestId("publizon-reader")).not.toBeNull();
    expect(queryByTestId("biblio-sample-ebook")).toBeNull();
  });

  it("Opens a Biblio loan in the loan reader, never as a sample", () => {
    const { queryByTestId } = render(<ReaderEntry loanid="loan-1" />);

    expect(queryByTestId("biblio-loan")).not.toBeNull();
  });
});
