// Argos's own lookup stops 100 commits back. Its CLI pages through up to
// 5,000 with POST /baseline, but only without GitHub content access, so do
// the same paging here.
// Any failure leaves the output empty, so Argos picks the baseline itself.
import { appendFileSync } from "node:fs";

const argosApiUrl =
  process.env.ARGOS_API_BASE_URL ?? "https://api.argos-ci.com/v2";
const { GITHUB_API_URL, GITHUB_REPOSITORY, GITHUB_SHA, GITHUB_OUTPUT } =
  process.env;

const pageSize = 100;
// The CLI's limit.
const maxPages = 50;
const requestTimeout = 30_000;

// The runner passes each input as INPUT_<NAME>, keeping hyphens.
function input(name) {
  return process.env[`INPUT_${name.toUpperCase()}`]?.trim() ?? "";
}

async function request(url, token, init = {}) {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(requestTimeout),
  });
  if (!response.ok) {
    throw new Error(`${url} returned ${response.status}`);
  }
  return response.json();
}

function requestGithub(path) {
  return request(
    `${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}${path}`,
    input("github-token"),
  );
}

// The base tip a test-merge commit was made from, or the commit before a
// push. Either way the commit under test is not its own baseline.
async function readFirstParent() {
  const { parents } = await requestGithub(`/commits/${GITHUB_SHA}`);
  return parents[0]?.sha ?? null;
}

// Nearest first, as POST /baseline expects.
async function readAncestors(commit, page) {
  const commits = await requestGithub(
    `/commits?sha=${commit}&per_page=${pageSize}&page=${page}`,
  );
  return commits.map(({ sha }) => sha);
}

// Argos picks the nearest complete, valid, approved and unrejected build of
// exactly this name.
async function findBaseline(commits) {
  const { baseline } = await request(
    `${argosApiUrl}/baseline`,
    input("argos-token"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commits, name: input("build-name"), mode: "ci" }),
    },
  );
  return baseline?.head.sha ?? null;
}

async function findReferenceCommit() {
  const start = await readFirstParent();
  if (!start) {
    return null;
  }
  for (let page = 1; page <= maxPages; page++) {
    const commits = await readAncestors(start, page);
    if (commits.length === 0) {
      return null;
    }
    const referenceCommit = await findBaseline(commits);
    if (referenceCommit) {
      return referenceCommit;
    }
  }
  return null;
}

try {
  const referenceCommit = await findReferenceCommit();
  if (referenceCommit) {
    console.log(`Reference commit: ${referenceCommit}`);
    appendFileSync(GITHUB_OUTPUT, `sha=${referenceCommit}\n`);
  } else {
    console.log(
      `::notice::No eligible ${input("build-name")} baseline among the ancestors of ${GITHUB_SHA}; Argos picks the baseline.`,
    );
  }
} catch (error) {
  console.log(
    `::warning::Could not find the Argos reference commit (${error.message}); Argos picks the baseline.`,
  );
}
