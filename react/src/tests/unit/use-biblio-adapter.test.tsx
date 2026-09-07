import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import useBiblioAdapter from "../../core/utils/useBiblioAdapter";
import { useConfig } from "../../core/utils/config";

/**
 * The feature flag every other Biblio path hangs off. The config is shipped
 * by the CMS, so a site on an older release will not have the key at all.
 */

vi.mock("../../core/utils/config", () => ({ useConfig: vi.fn() }));

const givenConfig = (value: string | undefined) => {
  vi.mocked(useConfig).mockReturnValue(((key: string) => {
    if (key !== "useBiblioAdapterConfig" || value === undefined) {
      // What useConfig does for a key the host never supplied.
      throw new Error(`Config entry ${key} is not defined`);
    }
    return value;
  }) as unknown as ReturnType<typeof useConfig>);
};

describe("useBiblioAdapter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Is on when the CMS says so", () => {
    givenConfig("1");

    expect(renderHook(() => useBiblioAdapter()).result.current).toBe(true);
  });

  it("Is off when the CMS says so", () => {
    givenConfig("0");

    expect(renderHook(() => useBiblioAdapter()).result.current).toBe(false);
  });

  it("Falls back to Publizon on a host that does not provide the config", () => {
    givenConfig(undefined);

    expect(renderHook(() => useBiblioAdapter()).result.current).toBe(false);
  });

  it("Treats any other value as off", () => {
    givenConfig("true");

    // Only the CMS's own "1" counts, so a typo cannot switch a library over.
    expect(renderHook(() => useBiblioAdapter()).result.current).toBe(false);
  });
});
