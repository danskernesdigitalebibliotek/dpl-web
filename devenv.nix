{ pkgs, lib, config, ... }:

# ---------------------------------------------------------------------------
# MOCK-UP: devenv.sh local development for dpl-web.
#
# Goal (as requested):
#   * The three Node.js apps (design-system, react, go) run DIRECTLY as
#     devenv processes — plain `pnpm run …`, no container in between.
#   * The CMS (a Drupal distribution) runs via `docker compose` wrapped in
#     devenv processes, so the whole stack starts/stops with one command.
#
# Start everything:   devenv up            (or `devenv up -d` to detach)
# One app only:       devenv up cms react
# Open a dev shell:    devenv shell
#
# This is a scaffold — the ports/env below mirror what the package.json
# scripts and cms/docker-compose.yml actually do today. The stack is served
# over plain HTTP on *.localhost (an RFC 6761 loopback name that browsers
# treat as a secure context), so there are no certs, no mkcert CA and no
# /etc/hosts entry to manage.
# ---------------------------------------------------------------------------

{
  # --- Toolchain -----------------------------------------------------------
  # Node is pinned to 24.x (.nvmrc / package.json "engines" want 24.15.0).
  # corepack ships the exact pnpm declared in the root package.json
  # ("packageManager": "pnpm@10.34.4"), so we don't pin pnpm separately.
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_24;
    corepack.enable = true;
  };

  languages.php = {
    enable = true;
    package = pkgs.php83;
  };

  # CLI tools the Taskfiles reach for.
  #
  # Docker is intentionally NOT here. devenv can't run a daemon, and our
  # processes/Taskfiles call `docker compose` (the CLI plugin), which comes
  # bundled with the host `docker` CLI — OrbStack on macOS, Docker Engine /
  # Docker Desktop on Linux. A nix `docker-compose` would only add the
  # redundant standalone binary (which nothing here invokes) and risk
  # version-skew against the host's compose plugin, so we rely on the host.
  packages = [
    pkgs.go-task        # `task` — the per-subproject runner (e.g. cms reset)
    pkgs.jq             # token:generate
    pkgs.perl           # token:generate rewrites *LIBRARY_TOKEN in .env files
  ];

  # --- Shared environment --------------------------------------------------
  env = {
    # cms/docker-compose.yml keys the project name, route TLD and container
    # user off these. Without COMPOSE_PROJECT_NAME the network/volumes would
    # be named after the cwd ("dpl-web") instead of the CMS. The browser-facing
    # host (dpl-web.localhost) is set explicitly on LAGOON_ROUTE in
    # docker-compose.devenv.yml — intentionally decoupled from the docker
    # project name kept here.
    COMPOSE_PROJECT_NAME = "dpl-cms";
    DEV_TLD = "localhost";
    UID = "1000"; # linux: match your host uid so bind-mounted files stay yours

    # Go's two origins (Next keeps already-set process.env values, so these win
    # over go/.env.local):
    #   DPL_GO_BASE_URL  — Go's OWN served URL (getBaseURL); browser-facing,
    #                      Go runs on :37103.
    DPL_GO_BASE_URL = "http://dpl-web.localhost:37103";
    #   DPL_CMS_BASE_URL — the CMS origin Go fetches SERVER-SIDE (Node, host
    #                      resolver). Plain `localhost` resolves on every OS
    #                      incl. macOS; *.localhost only auto-resolves inside
    #                      browsers. Browser-facing CMS URLs still come out as
    #                      dpl-web.localhost via Drupal's LAGOON_ROUTE.
    DPL_CMS_BASE_URL = "http://localhost:37102";

    # Silence pnpm's "newer version available" update check — corepack pins
    # pnpm to package.json's packageManager, so the notice is just noise.
    NPM_CONFIG_UPDATE_NOTIFIER = "false";

    # The CMS dev:start task runs dev-scripts/add-to-etc-hosts.sh to map the
    # dynamic docker IP to dpl-cms.docker. Under devenv we don't need it — the
    # stack is served on *.localhost (browser-resolved) and localhost — so opt
    # out of that sudo-driven /etc/hosts rewrite. The script honours this var
    # and no-ops; exported here so any `task` run from the devenv shell (e.g.
    # cms-reset → dev:reset → dev:start) inherits it.
    SKIP_ETC_HOSTS_MODIFICATION = "1";
  };

  # No host-resolution or TLS-trust tasks are needed: *.localhost auto-resolves
  # to loopback in the browser, and the CMS is served over plain HTTP, so there
  # is no mkcert CA to create/trust and no /etc/hosts entry to verify.

  # =========================================================================
  # CMS — Drupal distribution, run as `docker compose`
  # =========================================================================
  # Attached `up` (no --detach): process-compose owns the lifecycle and
  # streams the container logs into the devenv TUI. On shutdown it sends
  # SIGTERM, which `docker compose up` translates into stopping the stack.
  #
  # COMPOSE_FILE layers docker-compose.devenv.yml on top of the tracked file
  # to serve the CMS over plain HTTP on localhost:37102 (varnish exposed
  # directly; the TLS proxy is parked). Running from cms/ keeps the compose
  # project dir (and its relative build contexts) correct.
  processes.cms.exec = ''
    cd "$DEVENV_ROOT/cms"
    export COMPOSE_FILE="docker-compose.yml:docker-compose.devenv.yml"
    exec docker compose up
  '';
  processes.cms.process-compose = {
    # Consider the CMS "ready" once the varnish edge answers. The Node apps
    # (below) wait on this before starting.
    readiness_probe = {
      exec.command = ''
        cd "$DEVENV_ROOT/cms" && docker compose exec -T varnish true
      '';
      initial_delay_seconds = 5;
      period_seconds = 5;
      timeout_seconds = 5;
      failure_threshold = 30;
    };
  };

  # =========================================================================
  # WireMock mock services — kept on docker compose (react/docker-compose.yml)
  # =========================================================================
  # Starts the three mock backends the React apps hit (the react
  # `dev:mocks:start` set). Attached `up` so process-compose streams logs and
  # tears them down on shutdown.
  processes.wiremock.exec = ''
    cd "$DEVENV_ROOT/react"
    exec docker compose up wiremock wiremock-fbs wiremock-publizon
  '';

  # =========================================================================
  # Node apps — run directly (no container)
  # =========================================================================

  # Dev-server ports are pinned into a reserved 37100-37199 block so they
  # don't clash with the defaults (3000/6006) baked into package.json.

  # design-system: reproduce `dev` (Storybook + SCSS build watch + lint
  # watchers) but move Storybook off its hard-coded :6006 to :37100.
  processes.design-system.exec = ''
    cd "$DEVENV_ROOT/design-system"
    exec pnpm exec concurrently --raw \
      "DISABLE_ESLINT_PLUGIN=true storybook dev --port 37100 --host 0.0.0.0 --no-open --ci" \
      "pnpm run css:watch" \
      "pnpm run watch"
  '';

  # react: its package.json `dev` also hard-codes Storybook on :6006.
  # Reproduce it here with Storybook on :37101 + the lint/scss watchers.
  processes.react.exec = ''
    cd "$DEVENV_ROOT/react"
    exec pnpm exec concurrently --raw \
      "NODE_ENV=development storybook dev --port 37101 --host 0.0.0.0 --no-open --ci" \
      "pnpm run watch"
  '';

  # go: Next.js dev server over plain HTTP on :37103. The browser reaches it as
  # http://dpl-web.localhost:37103 (DPL_GO_BASE_URL); *.localhost is a secure
  # context, so no --experimental-https / cert is needed. We don't call the
  # package.json script verbatim because it hard-codes DPL_GO_BASE_URL=…:3000
  # and TLS; DPL_GO_BASE_URL/DPL_CMS_BASE_URL come from env above.
  # Waits for the CMS so the first GraphQL fetch doesn't fail.
  processes.go.exec = ''
    cd "$DEVENV_ROOT/go"
    export PORT=37103
    exec pnpm exec next dev
  '';
  processes.go.process-compose.depends_on.cms.condition = "process_healthy";

  # =========================================================================
  # One-off helpers (run manually, not long-running services)
  # =========================================================================

  # Install all workspace deps from the repo root (pnpm workspace).
  scripts.bootstrap.exec = ''
    cd "$DEVENV_ROOT" && pnpm install
  '';

  # Full clean rebuild of the CMS: containers, composer install, site
  # install, and linking the built design-system + react assets in.
  # Run once before your first `devenv up`.
  scripts.cms-reset.exec = ''
    task -d "$DEVENV_ROOT/cms" dev:reset
  '';

  enterShell = ''
    echo "dpl-web devenv — Node $(node --version), pnpm $(pnpm --version)"
    echo "  first run:  bootstrap && cms-reset"
    echo "  then:       devenv up"
    echo "  plain HTTP on *.localhost (secure context — no certs, no /etc/hosts):"
    echo "    cms http:37102 · go http:37103 · design-system http:37100 · react http:37101"
    echo "    browser host: dpl-web.localhost   ·   go→cms (server-side): localhost:37102"
    echo "  wiremock:   docker compose (react/docker-compose.yml, random ports)"
  '';
}
