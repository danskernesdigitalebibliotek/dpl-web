import React from "react";
import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InfomediaModal from "../../components/material/infomedia/InfomediaModal";
import { useGetInfomediaQuery } from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { Pid } from "../../core/utils/types/ids";

/**
 * A modal is rendered for every edition of a work, and the article body is one
 * request per edition. Fetching them all up front spends a full article
 * download on every edition the reader never opens.
 */

const PID = "870971-avis:47696135";
const MODAL_ID = `infomedia-modal-${PID}`;

let openModalIds: string[] = [];

// The modal chrome is not what is under test here - only the question of
// whether the article is asked for.
vi.mock("../../core/utils/modal", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useIsModalOpen: (modalId: string) => openModalIds.includes(modalId)
}));

vi.mock("../../core/dbc-gateway/generated/graphql", () => ({
  useGetInfomediaQuery: vi.fn()
}));

vi.mock("../../core/adgangsplatformen/useUserInfo", () => ({
  default: () => ({ data: { attributes: {} }, isLoading: false })
}));

vi.mock("../../core/utils/helpers/userInfo", () => ({
  isResident: () => true
}));

vi.mock("../../core/utils/helpers/user", () => ({
  isAnonymous: () => false
}));

vi.mock("../../core/utils/config", () => ({
  useConfig: () => () => "710100"
}));

vi.mock("../../core/utils/text", () => ({
  useText: () => (key: string) => key
}));

const manifestation = {
  pid: PID as Pid,
  titles: { main: ["Professor: Hvis vi skal redde klimaet"] },
  creators: []
} as unknown as Manifestation;

const renderModal = () =>
  render(
    <InfomediaModal
      manifestation={manifestation}
      infoMediaId="03500720200125gUJ80JzxQGmYeVHrNsfmA"
    />
  );

const askedForTheArticle = () => {
  const calls = vi.mocked(useGetInfomediaQuery).mock.calls;
  const [, options] = calls[calls.length - 1];
  return (options as { enabled: boolean }).enabled;
};

describe("InfomediaModal article fetching", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useGetInfomediaQuery).mockReturnValue({
      data: undefined,
      error: null,
      isLoading: false
    } as unknown as ReturnType<typeof useGetInfomediaQuery>);
  });

  it("leaves the article alone while the modal is closed", () => {
    openModalIds = [];
    renderModal();
    expect(askedForTheArticle()).toBe(false);
  });

  it("asks for the article once the modal is open", () => {
    openModalIds = [MODAL_ID];
    renderModal();
    expect(askedForTheArticle()).toBe(true);
  });

  it("ignores another edition's open modal", () => {
    openModalIds = ["infomedia-modal-870971-avis:48356117"];
    renderModal();
    expect(askedForTheArticle()).toBe(false);
  });
});
