#!/usr/bin/env bash
#
# The script must be run from within a running lagoon cli container and expects
# the root of the dpl-cms repository to be available at /app.
# The script is used to scan the translations of the custom modules and themes
# and is dependent on the potion module.

set -eo pipefail

LANGUAGE="$1"
PO_DIR="$2"

if [[ -z "${LANGUAGE}" ]]; then
	echo "usage: $0 <LANGUAGE> <PO_DIR>" >&2
	exit 1
fi
if [[ -z "${PO_DIR}" ]]; then
	echo "usage: $0 <LANGUAGE> <PO_DIR>" >&2
	exit 1
fi

# Get the directory of the script
THIS_DIR=$(dirname "$0")


# First import translations from custom modules.
drush potion:generate "$LANGUAGE" modules/custom/ "$PO_DIR" --recursive --default-write-mode=override

# Define an array of contrib modules to include
include_modules=()
while IFS= read -r line; do
    include_modules+=("$line")
done < "${THIS_DIR}"/scanned_modules.txt

for module in "${include_modules[@]}"; do
    # Prepend the base path to the directory
    dir="web/modules/contrib/$module"

    if [ -d "$dir" ]; then
        echo "Processing $module:"
        dir=$(echo "$dir" | sed 's/^web\///')
        drush potion:generate da "$dir" profiles/dpl_cms/translations --recursive --default-write-mode=merge
    fi
done

# Generate translations for custom themes.
drush potion:generate "$LANGUAGE" themes/custom/ "$PO_DIR" --recursive --default-write-mode=merge
