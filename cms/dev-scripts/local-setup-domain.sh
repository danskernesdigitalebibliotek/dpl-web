#!/usr/bin/env bash

DOMAIN="dpl-cms.docker"
CONTAINER_NAME="https"

CONTAINER_ID=$(docker compose ps "$CONTAINER_NAME" --quiet --no-trunc)
[[ -z "$CONTAINER_ID" ]] && exit

IP_ADDRESS=$(docker inspect "$CONTAINER_ID" --format '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}')
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
