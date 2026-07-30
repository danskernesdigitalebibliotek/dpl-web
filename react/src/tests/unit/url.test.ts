import { describe, expect, it } from "vitest";
import {
  appendQueryParametersToUrl,
  getUrlQueryParam,
  prettifyQueryColons
} from "../../core/utils/helpers/url";

describe("url query parameter encoding", () => {
  it("encodes a value exactly once so a single-decode reader recovers it", () => {
    const value = "digital-modal-870971-tsart:34310815";
    const url = appendQueryParametersToUrl(
      new URL("https://lib.example/work"),
      {
        modal: value
      }
    );

    // Readers such as the Modal component decode once with URLSearchParams.
    expect(new URLSearchParams(url.search).getAll("modal")).toContain(value);
  });

  it("keeps a reserved character intact across the login-redirect double hop", () => {
    // Reproduces openGuarded -> redirectToLoginAndBack -> Modal effect:
    // 1. the modal id is written into the return URL's query,
    // 2. the whole return path is carried as the `current-path` parameter,
    // 3. the auth platform decodes that value once and navigates back to it,
    // 4. the Modal component reads the id with a single decode.
    const modalId = "digital-modal-870971-tsart:34310815";

    const returnUrl = appendQueryParametersToUrl(
      new URL("https://lib.example/work"),
      { modal: modalId }
    );
    const redirectUrl = appendQueryParametersToUrl(
      new URL("https://login.example/"),
      { "current-path": `${returnUrl.pathname}${returnUrl.search}` }
    );

    const returnedPath = new URLSearchParams(redirectUrl.search).get(
      "current-path"
    ) as string;
    const returnedUrl = new URL(returnedPath, "https://lib.example");

    expect(new URLSearchParams(returnedUrl.search).getAll("modal")).toContain(
      modalId
    );
  });

  it("getUrlQueryParam reverses appendQueryParametersToUrl for reserved characters", () => {
    const value = 'term.title="Ada & Grace": en/historie';
    const url = appendQueryParametersToUrl(new URL("https://lib.example/"), {
      q: value
    });
    window.history.replaceState(null, "", `/${url.search}`);

    expect(getUrlQueryParam("q")).toBe(value);
  });

  it("prettifyQueryColons shows a literal colon but still round-trips", () => {
    const modalId = "digital-modal-870971-tsart:37743437";
    const url = appendQueryParametersToUrl(
      new URL("https://lib.example/work"),
      {
        modal: modalId
      }
    );
    // URLSearchParams percent-encodes the colon...
    expect(url.search).toContain("%3A");

    // ...prettifyQueryColons restores the human-readable colon.
    const pretty = prettifyQueryColons(url);
    expect(pretty).toContain(modalId);
    expect(pretty).not.toContain("%3A");

    // And the pretty URL is still parsed back to the same value.
    expect(new URL(pretty).searchParams.getAll("modal")).toContain(modalId);
  });
});
