#!/usr/bin/env bash

set -aeo pipefail

if [[ "$#" != "2" ]]; then
  cat <<EOF
Usage: $0 <SERVICE> <HOSTNAME>

Add docker compose service as hostname to /etc/hosts.
EOF
  exit 1;
fi

CONTAINER_NAME=$1
DOMAIN=$2
DOCKER_COMPOSE_FILES=${DOCKER_COMPOSE_FILES:-}

CONTAINER_ID=$(docker compose $DOCKER_COMPOSE_FILES ps "$CONTAINER_NAME" --quiet --no-trunc)
[[ -z "$CONTAINER_ID" ]] && exit

IP_ADDRESS=$(docker inspect $DOCKER_COMPOSE_FILES "$CONTAINER_ID" --format '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
[[ -z "$IP_ADDRESS" ]] && exit

# Check if the correct mapping already exists
if grep -qE "^${IP_ADDRESS}[[:space:]]+${DOMAIN}$" /etc/hosts; then
  echo "Already up-to-date: ${IP_ADDRESS} ${DOMAIN}"
  exit
fi

# Remove any existing line(s) for the domain
if grep -q "$DOMAIN" /etc/hosts; then
  sudo sed -i.bak "/$DOMAIN/d" /etc/hosts
fi

# Add the new mapping
printf "%s %s\n" "$IP_ADDRESS" "$DOMAIN" | sudo tee -a /etc/hosts >/dev/null
echo "Updated /etc/hosts with ${IP_ADDRESS} ${DOMAIN}"
