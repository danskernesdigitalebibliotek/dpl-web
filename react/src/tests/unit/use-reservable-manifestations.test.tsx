import { beforeEach, describe, expect, it, vi } from "vitest";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React, { ReactNode } from "react";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import UseReservableManifestations from "../../core/utils/UseReservableManifestations";
import { Manifestation } from "../../core/utils/types/entities";
import configReducer from "../../core/config.slice";
import { mutator } from "../../core/fbs/mutator/mutator";

vi.mock("../../core/fbs/mutator/mutator", () => ({ mutator: vi.fn() }));

const reservableManifestation = {
  pid: "870970-basis:52557240"
} as unknown as Manifestation;
const unReservableManifestation = {
  pid: "870970-basis:53292968"
} as unknown as Manifestation;
const manifestations = [reservableManifestation, unReservableManifestation];

const availability = [
  { recordId: "52557240", reservable: true },
  { recordId: "53292968", reservable: false }
];

const store = configureStore({
  reducer: combineReducers({ config: configReducer }),
  preloadedState: {
    config: { data: { blacklistedAvailabilityBranchesConfig: "" } }
  }
});

const renderReservableManifestations = (
  initialManifestations: Manifestation[]
) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>{children}</Provider>
    </QueryClientProvider>
  );

  return renderHook(
    ({ manifestations: currentManifestations }) =>
      UseReservableManifestations({ manifestations: currentManifestations }),
    {
      wrapper: Wrapper,
      initialProps: { manifestations: initialManifestations }
    }
  );
};

describe("UseReservableManifestations", () => {
  beforeEach(() => {
    vi.mocked(mutator).mockReset();
  });

  it("splits manifestations by whether FBS lets them be reserved", async () => {
    vi.mocked(mutator).mockResolvedValue(availability);

    const { result } = renderReservableManifestations(manifestations);

    expect(result.current.reservableManifestations).toBeNull();
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.reservableManifestations).toEqual([
      reservableManifestation
    ]);
    expect(result.current.unReservableManifestations).toEqual([
      unReservableManifestation
    ]);
  });

  it("asks FBS once however often it renders before the answer", async () => {
    vi.mocked(mutator).mockResolvedValue(availability);

    const { result, rerender } = renderReservableManifestations(manifestations);
    // A fresh but equal array each time, as callers derive it during render.
    rerender({ manifestations: [...manifestations] });
    rerender({ manifestations: [...manifestations] });

    await waitFor(() =>
      expect(result.current.reservableManifestations).not.toBeNull()
    );
    expect(mutator).toHaveBeenCalledTimes(1);
  });

  it("does not ask FBS without manifestations", () => {
    const { result } = renderReservableManifestations([]);

    expect(mutator).not.toHaveBeenCalled();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.reservableManifestations).toBeNull();
  });
});
