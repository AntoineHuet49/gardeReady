import path from 'node:path';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';

// Base Postgres jetable pour les tests d'intégration : jamais les conteneurs Docker partagés.
// Le schéma vient de Sources/database/initdb (même init que docker-compose).
let container: StartedPostgreSqlContainer;

export async function setup() {
    container = await new PostgreSqlContainer('postgres:16-alpine')
        .withCopyDirectoriesToContainer([
            { source: path.resolve(__dirname, '../../../database/initdb'), target: '/docker-entrypoint-initdb.d' },
        ])
        .start();
    // Lu par Utils/Database.ts à l'import, dans les workers qui héritent de cet environnement
    process.env.DATABASE_URL = container.getConnectionUri();
    process.env.JWT_SECRET ??= 'test-secret';
}

export async function teardown() {
    await container?.stop();
}
