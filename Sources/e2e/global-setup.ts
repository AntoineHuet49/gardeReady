import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { PostgreSqlContainer } from '@testcontainers/postgresql';

// Harnais e2e : base Postgres jetable (Testcontainers) + build client/API + API en sous-process
// sur le port 3100. Jamais les conteneurs Docker partagés ni les ports 3000/5173/5432.
// E2E_SKIP_BUILD=1 réutilise les builds existants (itérations locales).
const sources = path.resolve(__dirname, '..');
const build = path.join(__dirname, '.build');
export const PORT = 3100;
export const MAILJET_PORT = 3101;

// Faux Mailjet : node-mailjet (axios) respecte HTTPS_PROXY et envoie alors la requête en clair au
// « proxy ». On répond comme Mailjet et on garde les messages, lisibles par les tests sur GET /messages
// (le rapport PDF n'est envoyé que par e-mail, c'est le seul moyen de le récupérer).
function startFakeMailjet() {
    const messages: unknown[] = [];
    const server = http.createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => (body += chunk));
        req.on('end', () => {
            res.setHeader('Content-Type', 'application/json');
            if (req.method === 'GET') return res.end(JSON.stringify(messages));
            messages.push(...JSON.parse(body).Messages);
            res.end(JSON.stringify({ Messages: [{ Status: 'success', To: [{ MessageID: messages.length }] }] }));
        });
    });
    return new Promise<http.Server>((resolve) => server.listen(MAILJET_PORT, () => resolve(server)));
}

export default async function globalSetup() {
    // Builds dans Sources/e2e/.build (et non dans les dist/ des projets, que d'autres builds peuvent
    // réécrire en parallèle). L'API sert Sources/api/public relatif à son cwd, comme dans le Dockerfile :
    // on la lance depuis .build, ce qui évite aussi de charger les .env locaux (LoadEnv lit le cwd).
    if (!process.env.E2E_SKIP_BUILD) {
        fs.rmSync(build, { recursive: true, force: true });
        // VITE_API_URL '/api' : même origine que la page servie par l'API (écrase les .env locaux)
        execSync(`npm run build -- --outDir ${path.join(build, 'Sources/api/public')}`, {
            cwd: path.join(sources, 'client'),
            stdio: 'inherit',
            env: { ...process.env, NODE_ENV: 'production', VITE_API_URL: '/api' },
        });
        execSync(`npx tsup --out-dir ${path.join(build, 'api')}`, { cwd: path.join(sources, 'api'), stdio: 'inherit' });
    }

    const mailjet = await startFakeMailjet();
    // Schéma + jeu de données (comptes admin@gardeready.com / user@sdis49.fr) de Sources/database/initdb
    const db = await new PostgreSqlContainer('postgres:16-alpine')
        .withCopyDirectoriesToContainer([{ source: path.join(sources, 'database/initdb'), target: '/docker-entrypoint-initdb.d' }])
        .start();

    const api = spawn('node', [path.join(build, 'api/app.js')], {
        cwd: build,
        stdio: ['ignore', 'ignore', 'inherit'], // stdout = journal d'audit, trop bavard
        env: {
            ...process.env,
            NODE_PATH: path.join(sources, 'api/node_modules'), // dépendances externes du bundle tsup
            NODE_ENV: 'production', // pas 'development' : sinon sync({ alter: true })
            PORT: String(PORT),
            DATABASE_URL: db.getConnectionUri(),
            JWT_SECRET: 'e2e-secret',
            AUTH_PROVIDER: 'local',
            FRONTEND_URL: `http://localhost:${PORT}`,
            LOG_LEVEL: 'warn',
            MAILJET_API_KEY: 'e2e',
            MAILJET_API_SECRET: 'e2e',
            MAILJET_SENDER_EMAIL: 'e2e@sdis49.fr',
            HTTPS_PROXY: `http://localhost:${MAILJET_PORT}`,
        },
    });

    const teardown = async () => {
        api.kill();
        mailjet.close();
        await db.stop();
    };

    // Attend que l'API réponde (max ~30 s)
    for (let i = 0; ; i++) {
        try {
            if ((await fetch(`http://localhost:${PORT}/api`)).ok) break;
        } catch { /* pas encore prête */ }
        if (i > 60 || api.exitCode !== null) {
            await teardown();
            throw new Error("L'API e2e n'a pas démarré");
        }
        await new Promise((r) => setTimeout(r, 500));
    }

    return teardown;
}
