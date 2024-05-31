#!/usr/bin/env bash
#
# Restore drupal files from at Lagoon backup.
#
# The script must be run from within a running lagoon cli container and expects
# the root of the dpl-cms repository to be available at /app.
set -eo pipefail

BACKUP_FILES_DIR="$1"

if [[ -z "${BACKUP_FILES_DIR}" ]]; then
	echo "usage: $0 <BACKUP_FILES_DIR> " >&2
	exit 1
fi

set -u

while true; do
    read -r -p "The command will erase the current files directory. Do you want to continue [yY/nN]? " yn
    case $yn in
        [Yy]* ) break;;
        [Nn]* ) exit;;
        * ) echo "Please answer yes or no.";;
    esac
done

# Move in to /app so that all file-paths from now on matches what a developer
# standing at the root of dpl-cms would see
cd /app

if [[ ! -d "${BACKUP_FILES_DIR}"  ]]; then
    echo "Could not find the the directory ${BACKUP_FILES_DIR}"
    exit 1
fi

# Find all (hopefully only one) tarballs, print the name not path.
BACKUP_PACKAGE_PATH=$(find "${BACKUP_FILES_DIR}" -type f -iname "*.tar.gz")

if [[ ! 1 -eq "$(echo "${BACKUP_PACKAGE_PATH}" | wc -l)" ]]; then
    echo "${BACKUP_FILES_DIR} should contain a single tar.gz backup file"
    exit 1
fi

FILES_DIRECTORY="./web/sites/default/files"

echo "Verifying file"

if [[ ! -s "${BACKUP_PACKAGE_PATH}" ]]; then
    echo "package file ${BACKUP_PACKAGE_PATH} is missing or empty"
    exit 1
fi

if ! tar ztf "${BACKUP_PACKAGE_PATH}" data/nginx &> /dev/null; then
    echo "could not verify the tar.gz file: ${BACKUP_PACKAGE}"
    exit 1
fi

if [[ ! -d "${FILES_DIRECTORY}" ]]; then
  echo "Could not find destination ${FILES_DIRECTORY}"
  exit 1
fi

echo Removing existing sites/default/files
rm -fr "${FILES_DIRECTORY}"

echo Unpacking backup
mkdir -p "${FILES_DIRECTORY}"

tar --strip 2 --gzip --extract --file "${BACKUP_PACKAGE_PATH}" \
    --directory "${FILES_DIRECTORY}" data/nginx

echo Fixing permissions
chmod -R 777 "${FILES_DIRECTORY}"
