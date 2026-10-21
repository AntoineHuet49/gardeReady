import path from 'node:path';
import { defineConfig } from 'vitest/config';

const alias = { '~~': path.resolve(__dirname) };

export default defineConfig({
    test: {
        projects: [
            {
                resolve: { alias },
                test: { name: 'unit', include: ['tests/unit/**/*.test.ts'] },
            },
            {
                resolve: { alias },
                test: {
                    name: 'integration',
                    include: ['tests/integration/**/*.test.ts'],
                    // Une seule base Postgres (Testcontainers) partagée : fichiers exécutés l'un après l'autre
                    globalSetup: ['tests/integration/globalSetup.ts'],
                    poolOptions: { forks: { singleFork: true } },
                    hookTimeout: 120_000,
                },
            },
        ],
    },
});
