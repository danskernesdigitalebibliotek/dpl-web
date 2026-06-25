import { configureStore, combineReducers } from "@reduxjs/toolkit";
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { renderHook } from "@testing-library/react";
import configReducer from "../../core/config.slice";
import {
  useGetPhysicalHoldingsFilters,
  hasActivePhysicalHoldingsFilter
} from "../../core/utils/useGetPhysicalHoldingsFilters";

const createWrapper = (configData: Record<string, string>) => {
  const store = configureStore({
    reducer: combineReducers({ config: configReducer }),
    preloadedState: { config: { data: configData } }
  });

  return ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
};

describe("useGetPhysicalHoldingsFilters", () => {
  it("excludes online holdings and filters on the site's agency id", () => {
    const wrapper = createWrapper({ agencyConfig: '{"id":"710100"}' });

    const { result } = renderHook(() => useGetPhysicalHoldingsFilters(), {
      wrapper
    });

    expect(result.current).toStrictEqual({
      useOnlineHoldings: false,
      agencyId: ["710100"]
    });
  });
});

describe("hasActivePhysicalHoldingsFilter", () => {
  it("is false when no filter is active", () => {
    expect(hasActivePhysicalHoldingsFilter({})).toBe(false);
    expect(
      hasActivePhysicalHoldingsFilter({
        onShelf: false,
        branch: "",
        location: [],
        sublocation: undefined
      })
    ).toBe(false);
  });

  it("is true when the on-shelf toggle is active", () => {
    expect(hasActivePhysicalHoldingsFilter({ onShelf: true })).toBe(true);
  });

  it("is true for a scalar filter value (material grid)", () => {
    expect(hasActivePhysicalHoldingsFilter({ branch: "710100" })).toBe(true);
  });

  it("is true for a non-empty array filter value (location filter)", () => {
    expect(hasActivePhysicalHoldingsFilter({ department: ["adult"] })).toBe(
      true
    );
  });
});
