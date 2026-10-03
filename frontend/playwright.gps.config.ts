import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  testMatch: '**/gps-docker.spec.ts',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8080',
    browserName: 'chromium',
    headless: true,
  },
});