import { describe, expect, it } from "vitest";
import {
  AccessTypeCodeEnum,
  IdentifierTypeEnum,
  LinkStatusEnum
} from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { resolveOnlineButtonType } from "../../components/material/material-buttons/online/resolveOnlineButtonType";

const manifestationWith = (
  access: Manifestation["access"],
  materialType = "bog"
) =>
  ({
    pid: "870970-basis:12345678",
    access,
    accessTypes: [{ code: AccessTypeCodeEnum.Online }],
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

describe("resolveOnlineButtonType", () => {
  const ebook = (identifiers: Manifestation["identifiers"]) =>
    ({
      ...manifestationWith([
        {
          __typename: "Ereol",
          origin: "Ereolen",
          url: "https://ereolen.dk",
          canAlwaysBeLoaned: false
        }
      ]),
      materialTypes: [{ materialTypeSpecific: { display: "e-bog" } }],
      identifiers
    }) as Manifestation;

  it("carries the edition it lends for an e-book with a PUBLIZON identifier", () => {
    const result = resolveOnlineButtonType([
      ebook([{ type: IdentifierTypeEnum.Publizon, value: "9788711623497" }])
    ]);

    expect(result).toMatchObject({
      type: "internal",
      loanable: {
        id: { type: IdentifierTypeEnum.Publizon, value: "9788711623497" },
        opensIn: "reader"
      }
    });
  });

  it("offers no internal button for an e-book with only an ISBN", () => {
    const result = resolveOnlineButtonType([
      ebook([{ type: IdentifierTypeEnum.Isbn, value: "9788711623497" }])
    ]);

    expect(result).toBeNull();
  });

  it("resolves an external button for an active access url", () => {
    const result = resolveOnlineButtonType([
      manifestationWith([accessUrl(LinkStatusEnum.Ok)])
    ]);

    expect(result).toMatchObject({
      type: "external",
      access: { origin: "Filmstriben" }
    });
  });

  it("prefers DBC Webarkiv over other active access urls", () => {
    const result = resolveOnlineButtonType([
      manifestationWith([
        accessUrl(LinkStatusEnum.Ok),
        accessUrl(LinkStatusEnum.Ok, "DBC Webarkiv")
      ])
    ]);

    expect(result).toMatchObject({
      type: "external",
      access: { origin: "DBC Webarkiv" }
    });
  });

  it("resolves to nothing when every access url is broken", () => {
    const result = resolveOnlineButtonType([
      manifestationWith([accessUrl(LinkStatusEnum.Broken)])
    ]);

    expect(result).toBeNull();
  });

  it("resolves a digital article button for article manifestations", () => {
    const result = resolveOnlineButtonType([
      manifestationWith(
        [{ __typename: "DigitalArticleService", issn: "1234-5678" }],
        "artikel"
      )
    ]);

    expect(result).toEqual({ type: "digital-article" });
  });

  it("resolves a retriever article button", () => {
    const result = resolveOnlineButtonType([
      manifestationWith([{ __typename: "RetrieverService", id: "1" }])
    ]);

    expect(result).toEqual({ type: "retriever-article" });
  });

  it("resolves to nothing for a physical material", () => {
    const physicalManifestation = {
      ...manifestationWith([{ __typename: "RetrieverService", id: "1" }]),
      accessTypes: [{ code: AccessTypeCodeEnum.Physical }]
    } as Manifestation;

    expect(resolveOnlineButtonType([physicalManifestation])).toBeNull();
  });

  it("resolves to nothing for an access kind without a button", () => {
    const result = resolveOnlineButtonType([
      manifestationWith([
        { __typename: "InterLibraryLoan", loanIsPossible: true }
      ])
    ]);

    expect(result).toBeNull();
  });
});
