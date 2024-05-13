#!/usr/bin/env bash
# Restore and download files from a Lagoon backup.
set -eo pipefail

LAGOON_PROJECT="$1"
LAGOON_ENVIRONMENT="main"
BACKUP_TYPE="$2"
BACKUP_DESTINATION="$3"

if [[ -z "${LAGOON_PROJECT}" || -z "${BACKUP_TYPE}" || -z "${BACKUP_DESTINATION}" ]]; then
	echo "usage: $0 <LAGOON_PROJECT> <BACKUP_TYPE> <BACKUP_DESTINATION>" >&2
	exit 1
fi

BACKUPS=$(lagoon list backups -p "${LAGOON_PROJECT}" -e ${LAGOON_ENVIRONMENT} --output-json);
BACKUP_ID=$(echo "$BACKUPS" | jq -r ".data[] | select(.source == \"${BACKUP_TYPE}\") | .backupid" | head -n 1);
BACKUP_URL="Error";
# Wait a while we wait for the backup to become available.
# It must be retrieved before it can be downloaded.
while [[ $BACKUP_URL == "Error"* ]]; do
  echo -n ".";
  $(lagoon retrieve backup -p "${LAGOON_PROJECT}" -e ${LAGOON_ENVIRONMENT} --backup-id "${BACKUP_ID}" --force &> /dev/null) || true;
  # This will return an message in the format "Error: [error message]" if the
  # backup is not available for download yet.
  BACKUP_URL=$(lagoon get backup -p "${LAGOON_PROJECT}" -e ${LAGOON_ENVIRONMENT} --backup-id "${BACKUP_ID}" 2>/dev/null) || true;
done;
echo "";
curl -o "${BACKUP_DESTINATION}" "${BACKUP_URL}";
