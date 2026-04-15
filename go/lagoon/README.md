# Dockerfiles

This directory contains the Dockerfile and startup script for the Go (Next.js)
application deployed via Lagoon.

`node.dockerfile` is a self-contained multi-stage build that installs
dependencies, builds the Next.js app with environment-specific variables
(injected by Lagoon as build args), and produces the production runtime image.
Lagoon builds this directly from the `go/` context — no external pre-built
image is needed.

`start.sh` sets runtime environment variables and starts the Next.js server.
