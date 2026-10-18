import { pathToFileURL } from 'node:url';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function triggerDeploy(hook, commit, fetchImpl = fetch) {
  const url = new URL(hook);
  url.searchParams.set('ref', commit);
  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      signal: AbortSignal.timeout(30_000),
    });
  } catch {
    // Hook URLs contain credentials. Never include them in errors or logs.
    throw new Error('Render deploy hook could not be reached');
  }
  if (!response.ok) {
    throw new Error(`Render rejected deployment (HTTP ${response.status})`);
  }
}

export async function waitForJson(
  url,
  matches,
  { fetchImpl = fetch, sleep = delay, attempts = 48, interval = 15_000 } = {}
) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const response = await fetchImpl(url, {
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(15_000),
      });
      if (response.ok && matches(await response.json())) return;
    } catch {
      // An old deployment, cold start, or transient network failure is not ready.
    }
    if (attempt < attempts) await sleep(interval);
  }
  throw new Error(`Deployment did not become ready: ${url}`);
}

export async function deployProduction(env = process.env) {
  const { BACKEND_HOOK, FRONTEND_HOOK, GITHUB_SHA } = env;
  if (
    !BACKEND_HOOK ||
    !FRONTEND_HOOK ||
    !/^[a-f0-9]{40}$/i.test(GITHUB_SHA || '')
  ) {
    throw new Error(
      'Both Render deploy hooks and a full GITHUB_SHA are required'
    );
  }
  const backend =
    env.BACKEND_URL || 'https://issue-tracker-backend-23d7.onrender.com';
  const frontend = env.FRONTEND_URL || 'https://issue-tracker.ademdokur.dev';
  const ready = (body) => body.ready === true && body.commit === GITHUB_SHA;

  console.log(`Deploying backend commit ${GITHUB_SHA}...`);
  await triggerDeploy(BACKEND_HOOK, GITHUB_SHA);
  await waitForJson(`${backend}/api/health/ready`, ready);

  console.log('Backend ready; deploying frontend...');
  await triggerDeploy(FRONTEND_HOOK, GITHUB_SHA);
  await waitForJson(
    `${frontend}/deployment.json`,
    (body) => body.commit === GITHUB_SHA
  );
  await waitForJson(`${frontend}/api/health/ready`, ready);
  const page = await fetch(frontend, { signal: AbortSignal.timeout(30_000) });
  if (!page.ok || !page.headers.get('content-type')?.includes('text/html')) {
    throw new Error('Frontend did not return an HTML page');
  }
  console.log(
    `Deployment verified: frontend, backend and database at ${GITHUB_SHA}`
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  deployProduction().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
