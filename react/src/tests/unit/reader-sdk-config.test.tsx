import { configureStore, combineReducers } from "@reduxjs/toolkit";
import React, { ReactNode } from "react";
import { Provider } from "react-redux";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import configReducer from "../../core/config.slice";
import useReaderSdkConfig from "../../components/reader-player/useReaderSdkConfig";

/**
 * The WeDoBooks SDK cannot start on a partial configuration, so the CMS ships
 * all five values or none: a site mid-migration should fall back rather than
 * hand the SDK something it will fail on.
 *
 * A host that does not keep that promise has to be caught here instead.
 * Storybook is one - it passes every arg it knows, so an unconfigured
 * Storybook sends blank strings where the CMS sends nothing. These tests pin
 * that absent and blank both read as "no credentials here".
 */
const fullConfig = {
  wedobooksApplicationIdConfig: "app-1",
  wedobooksFirebaseApiKeyConfig: "firebase-key",
  wedobooksFirebaseProjectIdConfig: "firebase-project",
  wedobooksFirebaseAppIdConfig: "firebase-app",
  wedobooksReaderApiKeyConfig: "reader-key"
};

// A store per case, so config entries cannot leak between them - the reducer
// merges, and the app-wide singleton would carry the previous case's keys.
const givenConfig = (configData: Record<string, string>) => {
  const store = configureStore({
    reducer: combineReducers({ config: configReducer }),
    preloadedState: { config: { data: configData } }
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(() => useReaderSdkConfig(), { wrapper }).result.current;
};

describe("WeDoBooks SDK configuration", () => {
  beforeEach(() => {
    // Silenced rather than asserted on: the warning is for a developer
    // opening the console, not a contract worth pinning.
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("Hands over the configuration when all five values are set", () => {
    expect(givenConfig(fullConfig)).toEqual({
      applicationId: "app-1",
      firebaseApiKey: "firebase-key",
      firebaseProjectId: "firebase-project",
      firebaseAppId: "firebase-app",
      readerApiKey: "reader-key"
    });
  });

  it("Reads a blank value as unconfigured", () => {
    expect(
      givenConfig({ ...fullConfig, wedobooksReaderApiKeyConfig: "" })
    ).toBeNull();
  });

  it("Reads a missing key as unconfigured - the CMS' own way of saying no", () => {
    const withoutReaderApiKey = Object.fromEntries(
      Object.entries(fullConfig).filter(
        ([key]) => key !== "wedobooksReaderApiKeyConfig"
      )
    );

    expect(givenConfig(withoutReaderApiKey)).toBeNull();
  });

  it("Offers nothing to a site the CMS has told nothing", () => {
    expect(givenConfig({})).toBeNull();
  });
});
