import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: 'tests/browser',
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://localhost:3002', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node tests/dev-server.mjs',
      gracefulShutdown: { signal: 'SIGTERM', timeout: 5000 },
      url: 'http://localhost:3002/docs',
      timeout: 120000,
      reuseExistingServer: !process.env.CI,
      env: { DOCS_TEST_FIXTURES: '1' },
    },
    {
      command: 'node dist/src/main.js',
      cwd: '../../templates/apps.backend',
      url: 'http://localhost:3000/health',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'node tests/fixtures/server.mjs',
      url: 'http://127.0.0.1:3999/ready',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
