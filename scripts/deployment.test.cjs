const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const ts = require('typescript');
require('reflect-metadata');

// Load the controller without creating a real Prisma connection or Nest server.
const controllerPath = path.join(
  __dirname,
  '../apps/backend/src/app/health/health.controller.ts'
);
const compiled = ts.transpileModule(readFileSync(controllerPath, 'utf8'), {
  compilerOptions: {
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2021,
    experimentalDecorators: true,
  },
}).outputText;
const controllerExports = {};
const healthClock = { now: () => Date.now() };
vm.runInNewContext(compiled, {
  exports: controllerExports,
  process,
  Date: class extends Date {
    static now() {
      return healthClock.now();
    }
  },
  require: (name) => {
    if (name === '../database/prisma.service')
      return { PrismaService: class {} };
    if (name === '../auth/decorators/public.decorator') {
      return { Public: () => () => undefined };
    }
    return require(name);
  },
});
const { HealthController } = controllerExports;
const unavailable = () =>
  Promise.reject(new Error('private-database-password'));

test('database outage returns 503 without exposing connection details', async () => {
  const controller = new HealthController({ $queryRaw: unavailable });
  for (const method of ['check', 'ready']) {
    await assert.rejects(controller[method](), (error) => {
      assert.equal(error.getStatus(), 503);
      assert.equal(
        JSON.stringify(error.getResponse()).includes(
          'private-database-password'
        ),
        false
      );
      return true;
    });
  }
  assert.equal(controller.live().alive, true);
});

test('healthy database reports readiness and deployment identity', async () => {
  const controller = new HealthController({
    $queryRaw: async () => [{ value: 1 }],
  });
  const health = await controller.check();
  const readiness = await controller.ready();
  assert.equal(health.database, 'connected');
  assert.equal(readiness.ready, true);
  assert.equal(readiness.commit, process.env.RENDER_GIT_COMMIT || 'local');
});

test('health probes share queries, expire and recover without exhausting quota', async () => {
  let queries = 0;
  let databaseAvailable = true;
  const controller = new HealthController({
    $queryRaw: async () => {
      queries++;
      if (!databaseAvailable) throw new Error('Database unavailable');
      return [{ value: 1 }];
    },
  });
  try {
    healthClock.now = () => 0;
    await Promise.all(Array.from({ length: 20 }, () => controller.ready()));
    await controller.check();
    assert.equal(queries, 1);
    databaseAvailable = false;
    healthClock.now = () => 60_001;
    await assert.rejects(
      controller.ready(),
      (error) => error.getStatus() === 503
    );
    await assert.rejects(
      controller.check(),
      (error) => error.getStatus() === 503
    );
    assert.equal(queries, 2);
    databaseAvailable = true;
    healthClock.now = () => 120_002;
    assert.equal((await controller.ready()).ready, true);
    assert.equal(queries, 3);
  } finally {
    healthClock.now = () => Date.now();
  }
});

test('deploy hook pins commit and rejects HTTP failures', async () => {
  const { triggerDeploy } = await import('./deploy-render.mjs');
  await assert.rejects(
    triggerDeploy(
      'https://api.render.com/deploy/test?key=secret',
      'new-commit',
      async (url) => {
        assert.equal(url.searchParams.get('ref'), 'new-commit');
        assert.equal(url.searchParams.get('key'), 'secret');
        return new Response('', { status: 401 });
      }
    ),
    /HTTP 401/
  );
  await assert.rejects(
    triggerDeploy(
      'https://api.render.com/deploy/test?key=secret',
      'new-commit',
      async () => {
        throw new Error('URL contained key=secret');
      }
    ),
    (error) => !error.message.includes('secret')
  );
});

test('deployment waits past old commits, outages and non-JSON cold-start pages', async () => {
  const { waitForJson } = await import('./deploy-render.mjs');
  const responses = [
    new Response('{"ready":true,"commit":"old"}'),
    new Response('{"ready":true,"commit":"new"}', { status: 503 }),
    new Response('<html>Starting...</html>'),
    new Response('{"ready":true,"commit":"new"}'),
  ];
  let calls = 0;
  await waitForJson(
    'https://app.test/api/health/ready',
    (body) => body.ready && body.commit === 'new',
    {
      fetchImpl: async () => responses[calls++],
      sleep: async () => {},
      attempts: 4,
    }
  );
  assert.equal(calls, 4);
});

test('deployment fails when the expected healthy commit never arrives', async () => {
  const { waitForJson } = await import('./deploy-render.mjs');
  await assert.rejects(
    waitForJson('https://app.test/api/health/ready', (body) => body.ready, {
      fetchImpl: async () => new Response('{"ready":false}'),
      sleep: async () => {},
      attempts: 2,
    }),
    /did not become ready/
  );
});
