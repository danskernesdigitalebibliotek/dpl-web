# Cross-Project Development

Run the whole platform locally with [devenv.sh](https://devenv.sh) (on top of
Nix). One command (`devenv up`) brings up the stack: the CMS (via
`docker compose`), the WireMock mocks (via `docker compose`), and the three
Node apps (design-system, React, Go) as native processes — all served on the
single `dpl-cms.local` domain, one port per app. The definition lives in
`devenv.nix` at the repo root.

## What you get

`devenv up` starts everything on one domain, one port per surface:

| Surface       | URL                             | Runs as          |
| ------------- | ------------------------------- | ---------------- |
| CMS           | `https://dpl-cms.local:37102`   | `docker compose` |
| Go            | `https://dpl-cms.local:37103`   | native process   |
| design-system | `http://dpl-cms.local:37100`    | native process   |
| React         | `http://dpl-cms.local:37101`    | native process   |
| WireMock      | (random host ports)             | `docker compose` |

## Prerequisites (both platforms)

- **Nix + [devenv](https://devenv.sh/getting-started/)** — follow devenv's
  install guide. [direnv](https://direnv.net) is optional but recommended.
- **A working Docker install that provides `docker compose`.** devenv
  deliberately ships no Docker tooling of its own (it can't run a daemon
  anyway) — the `docker` CLI and its bundled `compose` plugin come from the
  host:
  - macOS: [OrbStack](https://orbstack.dev) (nicest — it resolves the
    `*.local` container domains automatically) or Docker Desktop.
  - Linux: Docker Engine with the Compose plugin, and your user in the
    `docker` group.
- **`mkcert`** installed and its root CA generated on the host (`mkcert
  -install` once). devenv also ships `mkcert`, but the CA must exist on the
  host so the https proxy container can mount it — see the platform notes.

## First-time setup

1. **Add the host entry.** The stack is served on `dpl-cms.local`, so it must
   resolve to loopback. devenv refuses to start without it (the `hosts:check`
   task fails fast with this instruction):

   ```bash
   echo "127.0.0.1 dpl-cms.local" | sudo tee -a /etc/hosts
   ```

2. **Do the platform-specific step below** ([macOS](#macos) / [Linux](#linux)).

3. **Enter the environment.** Either run `devenv shell`, or — if you use
   direnv — add `use devenv` to `.envrc` and run `direnv allow`. On entry,
   devenv verifies `/etc/hosts` and installs/refreshes the mkcert CA in your
   browser trust store automatically.

4. **Install dependencies and build the CMS** (one time):

   ```bash
   bootstrap    # pnpm install across the workspace
   cms-reset    # composer install + Drupal site install + asset linking
   ```

   `bootstrap` and `cms-reset` are devenv scripts (available inside the
   shell).

5. **Start everything:**

   ```bash
   devenv up          # attached; streams all logs (Ctrl-C stops the stack)
   devenv up -d       # detached
   devenv up cms go   # a subset only
   ```

   Go waits for the CMS to become healthy before starting, so the first
   GraphQL fetch doesn't fail.

## macOS

On macOS, `mkcert` stores its CA under `~/Library/Application Support/mkcert`,
but the https proxy container mounts `~/.local/share/mkcert`. Symlink the two
so the container finds the CA (one time, while no containers are running):

```bash
brew install mkcert nss
mkcert -install
mkdir -p ~/.local/share
find ~/.local/share -name mkcert -type d -delete
ln -s "$(mkcert -CAROOT)" ~/.local/share/mkcert
```

Either Docker runtime (OrbStack or Docker Desktop) works. This setup reaches
the stack through published localhost ports, so the `/etc/hosts` →
`127.0.0.1` entry from step 1 is what routes `dpl-cms.local` — keep it even
if OrbStack would otherwise resolve the domain to the container.

## Linux

- `mkcert`'s default CA path (`~/.local/share/mkcert`) already matches the
  container mount, so no symlink is needed — just `mkcert -install` once. The
  `mkcert:trust` task keeps the **browser** (NSS) trust up to date via
  `certutil` (shipped in the shell). Non-browser clients (`curl`, etc.) need
  the CA in the system trust store separately; Go sidesteps this with
  `NODE_TLS_REJECT_UNAUTHORIZED=0`. On NixOS, add the CA declaratively:

  ```nix
  security.pki.certificateFiles = [ "/home/<you>/.local/share/mkcert/rootCA.pem" ];
  ```

- The setup assumes host uid `1000` (so container-written files stay
  yours). If `id -u` differs, override `UID` in a `devenv.local.nix`:

  ```nix
  { ... }: { env.UID = "1001"; }   # your `id -u`
  ```

## Notes

- The CMS is reached on a non-standard port (`:37102`). A small devenv-only
  override (`cms/docker-compose.devenv.yml` + `cms/https-proxy.devenv.conf.template`)
  makes the proxy forward the real `Host`/port and scheme so Drupal generates
  correct absolute URLs. This is temporary pending
  [reload/https-proxy#81](https://github.com/reload/https-proxy/pull/81).
- Editing `devenv.nix` re-applies on the next `devenv up`. Template edits to
  the proxy override need the container recreated (`devenv up` handles it).

## Troubleshooting

### `cms-reset` fails with `origin/main` not found

The CMS build derives a version number from `origin/main`. If your clone
doesn't track it:

```bash
git fetch origin main:refs/remotes/origin/main
```
