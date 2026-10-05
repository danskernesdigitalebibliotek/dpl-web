import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The apps decide "logged in" from one thing: whether the host has set a
 * `user` token. The CMS can have an authenticated Drupal session and still set
 * only the library token - a Unilogin student is such a session, since
 * /dpl-react/user-tokens hands out `user` and `unregistered-user` tokens and
 * nothing else. That visitor must get the anonymous experience everywhere: no
 * patron data, no patron-authenticated service calls, and a login redirect
 * instead of a guarded action.
 */

vi.mock("../../core/store", () => ({
  store: { getState: () => ({ config: { data: {} } }) },
  persistor: { flush: () => Promise.resolve() }
}));

vi.mock("../../core/fbs/fbs", () => ({
  useGetPatronInformationByPatronIdV4: vi.fn(() => ({}))
}));

vi.mock("../../core/material-list-api/material-list", () => ({
  addItem: vi.fn(() => Promise.resolve())
}));

vi.mock("../../core/utils/helpers/url", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../core/utils/helpers/url")>()),
  redirectToLoginAndBack: vi.fn()
}));

// The token store is module state, so every test starts from a fresh copy -
// as a fresh page load does.
const loadModules = async () => ({
  token: await import("../../core/token"),
  user: await import("../../core/utils/helpers/user"),
  getServiceLayerConfig: (await import("../../core/serviceLayerConfig"))
    .default,
  usePatronData: (await import("../../core/utils/helpers/usePatronData"))
    .usePatronData,
  fbs: await import("../../core/fbs/fbs"),
  guardedRequests: await import("../../core/guardedRequests.slice"),
  url: await import("../../core/utils/helpers/url")
});

type Modules = Awaited<ReturnType<typeof loadModules>>;

const setLibraryTokenOnly = ({ token }: Modules) => {
  token.setToken(token.TOKEN_LIBRARY_KEY, "library-token");
};

const setPatronTokens = ({ token }: Modules) => {
  token.setToken(token.TOKEN_LIBRARY_KEY, "library-token");
  token.setToken(token.TOKEN_USER_KEY, "user-token");
};

describe("a session with only a library token", () => {
  let modules: Modules;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    modules = await loadModules();
  });

  it("is anonymous, not unregistered", () => {
    setLibraryTokenOnly(modules);

    expect(modules.user.isAnonymous()).toBe(true);
    expect(modules.user.isPatron()).toBe(false);
    // Unregistered would send the visitor into patron sign-up.
    expect(modules.user.isUnregistered()).toBe(false);
    expect(modules.user.getUserToken()).toBeNull();
  });

  it("tells the service layer the patron is not authenticated", () => {
    setLibraryTokenOnly(modules);

    const config = modules.getServiceLayerConfig();

    expect(config.isPatronAuthenticated).toBe(false);
    expect(config.getAuthHeader("fbs")).toBe("Bearer library-token");
  });

  it("does not fetch patron data", () => {
    setLibraryTokenOnly(modules);

    modules.usePatronData();

    expect(
      vi.mocked(modules.fbs.useGetPatronInformationByPatronIdV4)
    ).toHaveBeenCalledWith({ query: { enabled: false } });
  });

  it("stores a guarded request and sends the visitor to login", async () => {
    setLibraryTokenOnly(modules);
    const { guardedRequest, addRequest } = modules.guardedRequests;
    const dispatch = vi.fn();
    const getState = () => ({
      url: { data: { authUrl: "https://library.example/login" } }
    });
    const requestItem = {
      type: "addFavorite" as const,
      args: { id: "work-of:870970-basis:12345678" },
      app: "material" as const
    };

    await guardedRequest(requestItem)(dispatch, getState, undefined);
    // The login redirect waits for the persisted state to be flushed.
    await Promise.resolve();

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: addRequest.type,
        payload: expect.objectContaining({ type: "addFavorite" })
      })
    );
    expect(vi.mocked(modules.url.redirectToLoginAndBack)).toHaveBeenCalledWith(
      expect.objectContaining({
        authUrl: new URL("https://library.example/login")
      })
    );
    // The request is only replayed after login, never sent without a patron.
    const { addItem } =
      await import("../../core/material-list-api/material-list");
    expect(vi.mocked(addItem)).not.toHaveBeenCalled();
  });

  // Guards against the tests above passing for the wrong reason.
  it("differs from a patron session only by the user token", () => {
    setPatronTokens(modules);

    expect(modules.user.isAnonymous()).toBe(false);
    expect(modules.user.isPatron()).toBe(true);
    expect(modules.user.getUserToken()).toBe("user-token");
    expect(modules.getServiceLayerConfig().isPatronAuthenticated).toBe(true);
    modules.usePatronData();
    expect(
      vi.mocked(modules.fbs.useGetPatronInformationByPatronIdV4)
    ).toHaveBeenCalledWith({ query: { enabled: true } });
  });
});
