import { describe, expect, it } from "vitest";
import {
  AccessTypeCodeEnum,
  LinkStatusEnum
} from "../../core/dbc-gateway/generated/graphql";
import { Manifestation } from "../../core/utils/types/entities";
import { resolveMaterialButtonsType } from "../../components/material/material-buttons/resolveMaterialButtonsType";

const manifestationWith = ({
  accessTypes,
  access = [],
  materialType = "bog"
}: {
  accessTypes: AccessTypeCodeEnum[];
  access?: Manifestation["access"];
  materialType?: string;
}) =>
  ({
    access,
    accessTypes: accessTypes.map((code) => ({ code })),
    identifiers: [],
    materialTypes: [{ materialTypeSpecific: { display: materialType } }]
  }) as unknown as Manifestation;

const activeAccessUrl = {
  __typename: "AccessUrl",
  status: LinkStatusEnum.Ok,
  origin: "Filmstriben",
  url: "https://filmstriben.dk",
  loginRequired: false
} as const;

describe("resolveMaterialButtonsType", () => {
  it("resolves physical for a physical book", () => {
    const result = resolveMaterialButtonsType([
      manifestationWith({ accessTypes: [AccessTypeCodeEnum.Physical] })
    ]);

    expect(result).toEqual({ type: "physical" });
  });

  it("resolves online with the concrete online button for an online material", () => {
    const result = resolveMaterialButtonsType([
      manifestationWith({
        accessTypes: [AccessTypeCodeEnum.Online],
        access: [activeAccessUrl]
      })
    ]);

    expect(result).toMatchObject({
      type: "online",
      online: { kind: "external" }
    });
  });

  it("prefers physical when a non-article carries both access types", () => {
    const result = resolveMaterialButtonsType([
      manifestationWith({
        accessTypes: [AccessTypeCodeEnum.Physical, AccessTypeCodeEnum.Online],
        access: [activeAccessUrl]
      })
    ]);

    expect(result).toEqual({ type: "physical" });
  });

  it("resolves online for a paper article with a digital article service", () => {
    const result = resolveMaterialButtonsType([
      manifestationWith({
        accessTypes: [AccessTypeCodeEnum.Physical, AccessTypeCodeEnum.Online],
        access: [{ __typename: "DigitalArticleService", issn: "1234-5678" }],
        materialType: "artikel"
      })
    ]);

    expect(result).toEqual({
      type: "online",
      online: { kind: "digital-article" }
    });
  });

  it("resolves to nothing for a physical material whose only access url is broken and has no physical access", () => {
    const result = resolveMaterialButtonsType([
      manifestationWith({
        accessTypes: [AccessTypeCodeEnum.Online],
        access: [{ ...activeAccessUrl, status: LinkStatusEnum.Broken }]
      })
    ]);

    expect(result).toBeNull();
  });

  it("resolves to nothing when there is no access at all", () => {
    const result = resolveMaterialButtonsType([
      manifestationWith({ accessTypes: [] })
    ]);

    expect(result).toBeNull();
  });
});
