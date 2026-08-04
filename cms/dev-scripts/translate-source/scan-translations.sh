#!/usr/bin/env bash
#
# The script must be run from within a running lagoon cli container and expects
# the dpl-cms repository to be available at /app.
# The script scans custom modules, custom themes and a curated list of contrib
# modules for translatable strings and writes them all to a single .po file.
# It is dependent on the potx module.
#
# Existing translations are read from the database and filled into the result,
# so the output is a complete .po file rather than an empty template.

set -eo pipefail

LANGUAGE="$1"
# Destination directory, relative to the Drupal root.
PO_DIR="$2"

if [[ -z "${LANGUAGE}" ]]; then
	echo "usage: $0 <LANGUAGE> <PO_DIR>" >&2
	exit 1
fi
if [[ -z "${PO_DIR}" ]]; then
	echo "usage: $0 <LANGUAGE> <PO_DIR>" >&2
	exit 1
fi

# Get the directory of the script.
THIS_DIR=$(dirname "$0")

DRUPAL_ROOT=$(drush status --field=root)
DESTINATION="${DRUPAL_ROOT}/${PO_DIR}/${LANGUAGE}.po"

# Potx validates --language against the installed languages and silently drops
# the option if it does not match, which would produce an untranslated template
# and wipe every translation from the result. Fail loudly instead.
if ! drush php:eval "print array_key_exists('${LANGUAGE}', \Drupal::languageManager()->getLanguages()) ? 'INSTALLED' : 'MISSING';" | grep -q INSTALLED; then
	echo "error: language '${LANGUAGE}' is not installed - refusing to scan." >&2
	echo "       Potx would silently emit an untranslated template." >&2
	exit 1
fi

WORK_DIR=$(mktemp -d)
trap 'rm -rf "${WORK_DIR}"' EXIT

# Potx writes its output as general.pot - plus installer.pot when there are
# install-time strings - using hardcoded names, into the current directory.
# Drush changes directory to the Drupal root, so that is where they land
# regardless of where this script is run from. Each scan's output therefore has
# to be moved aside before the next scan overwrites it.
scan_counter=0
run_potx() {
	scan_counter=$((scan_counter + 1))

	# Potx logs a line per scanned file, which is thousands of lines of noise
	# in CI. Drop those but keep the summary table and any reported problems.
	# sed is used rather than grep because grep exits non-zero when it filters
	# everything out, which would fail the pipeline.
	drush potx single --language="${LANGUAGE}" --translations "$@" |
		sed '/^Processing /d'

	for name in general installer; do
		if [[ -f "${DRUPAL_ROOT}/${name}.pot" ]]; then
			mv "${DRUPAL_ROOT}/${name}.pot" \
				"${WORK_DIR}/$(printf '%03d' "${scan_counter}")-${name}.pot"
		fi
	done
	# Producing no file at all is normal for a directory that holds no
	# translatable strings.
}

echo "Scanning custom modules"
run_potx --folder="${DRUPAL_ROOT}/modules/custom/"

echo "Scanning custom themes"
run_potx --folder="${DRUPAL_ROOT}/themes/custom/"

# Only a curated list of contrib modules is scanned. They are scanned by
# directory rather than by module name, because some entries are project
# directories that ship their functionality in submodules and so are not
# themselves modules that Drupal knows about - varnish_purge is one of those.
while IFS= read -r module; do
	if [[ -z "${module}" ]]; then
		continue
	fi

	dir="${DRUPAL_ROOT}/modules/contrib/${module}"
	if [[ ! -d "${dir}" ]]; then
		continue
	fi

	echo "Scanning contrib module ${module}"
	run_potx --folder="${dir}/"
done < "${THIS_DIR}"/scanned_modules.txt

shopt -s nullglob
scan_output=("${WORK_DIR}"/*.pot)
if [[ "${#scan_output[@]}" -eq 0 ]]; then
	echo "error: no scan produced any output - refusing to write an empty file." >&2
	exit 1
fi

# Combine the individual scans into the single destination file.
# --no-location strips the "#:" source references potx adds. They would add
# thousands of lines to the committed file and churn on every code move, and
# POEditor does not need them.
# --use-first keeps the first translation for strings found by several scans.
# They all come from the same database, so any of them will do.
# --sort-output gives a deterministic order. Without it the order is a side
# effect of the order the directories happen to be scanned in, which makes the
# diff between two runs unreadable. POEditor identifies a string by its context
# and source text, so the order carries no meaning for it.
echo "Combining output of ${scan_counter} scans into ${PO_DIR}/${LANGUAGE}.po"
msgcat --no-location --use-first --sort-output -o "${DESTINATION}" "${scan_output[@]}"

# Potx marks the header entry fuzzy, which is the convention for a template.
# What we produce is a complete translation file, so drop the flag to keep the
# format consistent with what POEditor has been receiving. The header is the
# only place potx emits it, and this file is rebuilt from scratch on every run,
# so there are no per-string fuzzy flags to preserve here.
sed -i '/^#, fuzzy$/d' "${DESTINATION}"
