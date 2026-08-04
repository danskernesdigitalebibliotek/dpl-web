// Zero-dependency static server for the production-bundle smoke test.
//
// It serves the webpack output in `dist/` and, for `/`, generates a harness
// page that loads every production chunk in a real browser in the same order
// a CMS page would, then mounts each registered dpl-react app. The point is to
// evaluate the real production bundle in a browser: regressions like a leaked
// `process.env` reference (`process is not defined`) only surface here, not in
// unit tests (jsdom has `process`) or a successful webpack build (never runs
// the code).

import { createServer } from "node:http";
import { readFile, readdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../../dist", import.meta.url));
// Kept in sync with cypress.smoke.config.js baseUrl and the react-ci wait-on.
const PORT = 57022;

// The shared/infrastructure chunks that must load before any app chunk.
// Everything else emitted to dist is an app entry (one per src/apps/**.mount.ts).
const INFRA_ORDER = ["runtime.js", "bundle.js", "mount.js"];

const CONTENT_TYPES = {
  ".js": "text/javascript; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8"
};

async function listChunks() {
  const files = await readdir(DIST);
  const js = files.filter((f) => f.endsWith(".js"));
  const infra = INFRA_ORDER.filter((f) => js.includes(f));
  const apps = js.filter((f) => !INFRA_ORDER.includes(f)).sort();
  return { infra, apps };
}

async function harnessHtml() {
  const { infra, apps } = await listChunks();
  const scriptTags = [...infra, ...apps]
    .map((f) => `<script src="/${f}"></script>`)
    .join("\n");
  const expectedAppCount = apps.length;

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>dpl-react production bundle smoke test</title></head>
<body>
<script>
  // Collect anything thrown while the production chunks evaluate or while apps
  // mount. A leaked \`process\` reference throws here at script-evaluation time.
  window.smokeErrors = [];
  window.addEventListener("error", (event) => {
    window.smokeErrors.push(
      String((event.error && event.error.stack) || event.message)
    );
  });
  window.addEventListener("unhandledrejection", (event) => {
    window.smokeErrors.push("unhandledrejection: " + String(event.reason));
  });
  // Neutralise network so mounting apps neither hit a backend nor hang. We are
  // asserting that the bundle evaluates and apps mount, not backend behaviour.
  window.fetch = () => new Promise(() => {});
  const RealXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function SmokeXHR() {
    const xhr = new RealXHR();
    xhr.send = () => {};
    return xhr;
  };
  // How many app chunks the server injected below, so the spec can report
  // registered-vs-expected coverage.
  window.smokeExpectedAppCount = ${expectedAppCount};
</script>
${scriptTags}
<script>
  // Anything thrown up to this point happened while the production chunks were
  // evaluating — this is exactly where a leaked \`process\` reference throws
  // ("process is not defined"). Snapshot it now: these are the HARD failures.
  window.smokeEvalErrors = window.smokeErrors.slice();

  // Each app chunk registered itself into window.dplReact.apps via addMount.
  window.smokeApps = Object.keys(
    (window.dplReact && window.dplReact.apps) || {}
  );

  // Best-effort: mount every registered app to exercise its render path. Apps
  // legitimately throw here when the host hasn't supplied their text/config
  // (e.g. "errorMessagesConfig"), so mount-phase errors are reported by the
  // spec, not failed on. mount() renders on a macrotask, so any mount-phase
  // error lands in smokeErrors after this script returns.
  window.smokeApps.forEach((name) => {
    const container = document.createElement("div");
    container.setAttribute("data-dpl-app", name);
    document.body.appendChild(container);
  });
  if (window.dplReact && typeof window.dplReact.mount === "function") {
    window.dplReact.mount(document.body);
  }
  window.smokeReady = true;
</script>
</body>
</html>`;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname === "/" || url.pathname === "/index.html") {
      res.writeHead(200, { "content-type": CONTENT_TYPES[".html"] });
      res.end(await harnessHtml());
      return;
    }

    // Only serve files that actually live in dist/, by basename, so path
    // traversal can never reach outside the build output.
    const name = url.pathname.replace(/^\/+/, "");
    const files = await readdir(DIST);
    if (!files.includes(name)) {
      res.writeHead(404).end("Not found");
      return;
    }
    const body = await readFile(join(DIST, name));
    res.writeHead(200, {
      "content-type": CONTENT_TYPES[extname(name)] || "application/octet-stream"
    });
    res.end(body);
  } catch (error) {
    res.writeHead(500).end(String(error));
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Smoke server serving ${DIST} on http://localhost:${PORT}`);
});
