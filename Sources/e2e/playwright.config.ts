import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://localhost:3100';

// Une seule base partagée et des données globales (rotation, gardes) : exécution en série, sans
// relance (un test rejoué retomberait sur les données créées par sa 1re tentative).
export default defineConfig({
    testDir: './tests',
    globalSetup: './global-setup.ts',
    workers: 1,
    forbidOnly: !!process.env.CI,
    reporter: [['list'], ['html', { open: 'never' }]],
    use: { baseURL, trace: 'retain-on-failure', locale: 'fr-FR', timezoneId: 'Europe/Paris' },
    projects: [
        { name: 'setup', testMatch: /auth\.setup\.ts/ },
        {
            name: 'desktop',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
            testIgnore: /mobile\.spec\.ts/,
        },
        {
            name: 'mobile',
            use: { ...devices['Pixel 7'] },
            dependencies: ['setup'],
            testMatch: /mobile\.spec\.ts/,
        },
    ],
});
