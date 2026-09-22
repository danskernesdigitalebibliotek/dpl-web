import { describe, expect, it } from "vitest";
import { LinkStatusEnum } from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { resolveOnlineButtonKind } from "../../components/material/material-buttons/online/resolveOnlineButtonKind";

const manifestationWith = (
  access: Manifestation["access"],
  materialType = "bog"
) =>
  ({
    pid: "870970-basis:12345678",
    access,
    accessTypes: [],
    materialTypes: [
      { materialTypeSpecific: { display: materialType, code: "BOOK" } }
    ],
    identifiers: [],
    edition: { publicationYear: { display: "2020" } }
  }) as unknown as Manifestation;

const accessUrl = (status: LinkStatusEnum, origin = "Filmstriben") =>
  ({
    __typename: "AccessUrl",
    status,
    origin,
    url: `https://${origin.toLowerCase()}.dk`,
    loginRequired: false
  }) as const;

describe("resolveOnlineButtonKind", () => {
  it("resolves an external button for an active access url", () => {
    const result = resolveOnlineButtonKind([
      manifestationWith([accessUrl(LinkStatusEnum.Ok)])
    ]);

    expect(result).toMatchObject({
      kind: "external",
      access: { origin: "Filmstriben" }
    });
  });

  it("prefers DBC Webarkiv over other active access urls", () => {
    const result = resolveOnlineButtonKind([
      manifestationWith([
        accessUrl(LinkStatusEnum.Ok),
        accessUrl(LinkStatusEnum.Ok, "DBC Webarkiv")
      ])
    ]);

    expect(result).toMatchObject({
      kind: "external",
      access: { origin: "DBC Webarkiv" }
    });
  });

  it("resolves to nothing when every access url is broken", () => {
    const result = resolveOnlineButtonKind([
      manifestationWith([accessUrl(LinkStatusEnum.Broken)])
    ]);

    expect(result).toBeNull();
  });

  it("resolves a digital article button for article manifestations", () => {
    const result = resolveOnlineButtonKind([
      manifestationWith(
        [{ __typename: "DigitalArticleService", issn: "1234-5678" }],
        "artikel"
      )
    ]);

    expect(result).toEqual({ kind: "digital-article" });
  });

  it("resolves a retriever article button", () => {
    const result = resolveOnlineButtonKind([
      manifestationWith([{ __typename: "RetrieverService", id: "1" }])
    ]);

    expect(result).toEqual({ kind: "retriever-article" });
  });

  it("resolves to nothing for an access kind without a button", () => {
    const result = resolveOnlineButtonKind([
      manifestationWith([
        { __typename: "InterLibraryLoan", loanIsPossible: true }
      ])
    ]);

    expect(result).toBeNull();
  });
});
