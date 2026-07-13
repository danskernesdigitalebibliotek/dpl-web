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
# scripts and cms/docker-compose.yml actually do today, but you'll want to
# reconcile the CMS origin (see DPL_GO_BASE_URL note) with how you route
# locally (the *.local https proxy vs. a fixed host port).
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
    pkgs.mkcert         # the https proxy container expects a local CA
    pkgs.nssTools       # certutil — lets `mkcert -install` reach the browser (NSS) trust store
  ];

  # --- Shared environment --------------------------------------------------
  env = {
    # cms/docker-compose.yml keys the project name, route TLD and container
    # user off these. Without COMPOSE_PROJECT_NAME the network/volumes would
    # be named after the cwd ("dpl-web") instead of the CMS.
    COMPOSE_PROJECT_NAME = "dpl-cms";
    DEV_TLD = "local";
    UID = "1000"; # linux: match your host uid so bind-mounted files stay yours

    # Go's two origins, both on the shared dpl-cms.local domain (Next keeps
    # already-set process.env values, so these win over go/.env.local):
    #   DPL_GO_BASE_URL  — Go's OWN served URL (getBaseURL); Go runs on :37103.
    #   DPL_CMS_BASE_URL — the CMS origin; the https proxy is pinned to :37102.
    DPL_GO_BASE_URL = "https://dpl-cms.local:37103";
    DPL_CMS_BASE_URL = "https://dpl-cms.local:37102";
    NODE_TLS_REJECT_UNAUTHORIZED = "0"; # matches go's `dev`/`dev:https` scripts

    # Silence pnpm's "newer version available" update check — corepack pins
    # pnpm to package.json's packageManager, so the notice is just noise.
    NPM_CONFIG_UPDATE_NOTIFIER = "false";

    # The CMS dev:start task runs dev-scripts/add-to-etc-hosts.sh to map the
    # dynamic docker IP to dpl-cms.docker. Under devenv we manage host
    # resolution ourselves (the hosts:check task + fixed dpl-cms.local), so
    # opt out of that sudo-driven /etc/hosts rewrite. The script honours this
    # var and no-ops; it's exported here so any `task` run from the devenv
    # shell (e.g. the cms-reset script → dev:reset → dev:start) inherits it.
    SKIP_ETC_HOSTS_MODIFICATION = "1";
  };

  # =========================================================================
  # Host resolution — fail fast if dpl-cms.local isn't mapped to localhost
  # =========================================================================
  # The whole stack is served on https://dpl-cms.local:<port>, so the name
  # must resolve to loopback. This task runs before anything else and aborts
  # shell/`devenv up` entry with instructions if the record is missing.
  tasks."hosts:check" = {
    description = "Require a 127.0.0.1/::1 dpl-cms.local entry in /etc/hosts.";
    before = [ "devenv:enterShell" "mkcert:trust" ];
    exec = ''
      set -eu
      host="dpl-cms.local"
      if grep -qsE "^[^#]*\b(127\.0\.0\.1|::1)\b[^#]*\b$host\b" /etc/hosts; then
        exit 0
      fi
      cat >&2 <<EOF

  ✖ Missing /etc/hosts entry for $host

    Every app is served on https://$host:<port>, so the name must resolve to
    localhost. devenv will not continue until this is fixed. Add it with:

        echo "127.0.0.1 $host" | sudo tee -a /etc/hosts

    (the repo's cms/dev-scripts/add-to-etc-hosts.sh does the equivalent.)

EOF
      exit 1
    '';
  };

  # =========================================================================
  # TLS trust — make the mkcert CA trusted automatically
  # =========================================================================
  # The https proxy signs its dpl-cms.local cert with the mkcert local CA
  # (mounted from ~/.local/share/mkcert). For the browser to trust
  # https://dpl-cms.local:37102 that CA must be in the trust store. Runs
  # before the shell/processes so it's ready by the time the proxy is up.
  tasks."mkcert:trust" = {
    description = "Create the mkcert CA if missing and ensure it's trusted (idempotent).";
    before = [ "devenv:enterShell" ];
    exec = ''
      set -eu
      caroot="$(mkcert -CAROOT)"

      # No CA yet → create + install it (also populates the proxy's mount).
      if [ ! -f "$caroot/rootCA.pem" ]; then
        echo "mkcert: creating and installing local CA…"
        mkcert -install || echo "mkcert: install reported an issue — see above." >&2
        exit 0
      fi

      # CA exists → check it's actually in the browser (NSS) store, and only
      # (re)install if it's missing. `mkcert -install` is idempotent and, on
      # NixOS (no system-store target), never prompts for sudo, so a redundant
      # run is harmless — this just keeps shell entry quiet in the common case.
      if command -v certutil >/dev/null 2>&1 \
         && ! certutil -d "sql:$HOME/.pki/nssdb" -L 2>/dev/null | grep -qi mkcert; then
        echo "mkcert: CA not found in browser trust store — installing…"
        mkcert -install || echo "mkcert: install reported an issue — see above." >&2
      fi
    '';
  };

  # =========================================================================
  # CMS — Drupal distribution, run as `docker compose`
  # =========================================================================
  # Attached `up` (no --detach): process-compose owns the lifecycle and
  # streams the container logs into the devenv TUI. On shutdown it sends
  # SIGTERM, which `docker compose up` translates into stopping the stack.
  #
  # COMPOSE_FILE layers docker-compose.devenv.yml on top of the tracked file
  # to pin the https proxy to localhost:37102. Running from cms/ keeps the
  # compose project dir (and its relative build contexts) correct.
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

  # go: Next.js dev server over HTTPS on dpl-cms.local:37103, like the CMS.
  # This mirrors package.json's `dev:https` (`-H dpl-cms.local
  # --experimental-https`, which mints a mkcert-signed cert — trusted thanks
  # to the mkcert:trust task) but on our pinned port. We don't call the script
  # verbatim because it hard-codes DPL_GO_BASE_URL=…:3000 and no port, which
  # fights this layout; DPL_GO_BASE_URL/DPL_CMS_BASE_URL come from env above.
  # Waits for the CMS so the first GraphQL fetch doesn't fail.
  processes.go.exec = ''
    cd "$DEVENV_ROOT/go"
    export PORT=37103
    exec pnpm exec next dev -H dpl-cms.local --experimental-https
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
    echo "              /etc/hosts is verified and mkcert CA trust handled on shell entry"
    echo "  then:       devenv up"
    echo "  one domain (dpl-cms.local), one port each:"
    echo "    cms https:37102 · go https:37103 · design-system http:37100 · react http:37101"
    echo "  wiremock:   docker compose (react/docker-compose.yml, random ports)"
  '';
}
