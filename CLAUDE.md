# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

GardeReady is a fullstack web app for the SDIS 49 (Maine-et-Loire fire and rescue service) to manage on-duty crew rosters (gardes) and vehicle equipment checks. Firefighter teams verify equipment status in intervention vehicles against a hierarchical checklist and generate PDF reports.

## Repository layout

Three independently-versioned Node projects under `Sources/`, each with its own `package.json`/`node_modules`:

```
Sources/
├── api/          # Backend — Express 5 + TypeScript + Sequelize (PostgreSQL)
├── client/       # Frontend — React 18 + TypeScript + Vite
└── database/     # PostgreSQL init scripts + seed data
Script/database/  # Production/deployment SQL (init-deployment.sql)
docs/             # LOGGING.md, COMPTES_TEST.md, EMAIL_TROUBLESHOOTING.md
```

There is no root `package.json` — always `cd` into `Sources/api` or `Sources/client` before running npm commands.

## Commands

### Backend (`Sources/api`)
```bash
npm run dev          # nodemon ./app.ts — hot reload, port 3000
npm run build         # tsup app.ts --format cjs --target node18 --clean -> dist/app.js
npm run start         # node dist/app.js (run build first)
npm run start:prod    # node app.js (alternative production entry)
```
No test suite or lint script is configured for the API.

### Frontend (`Sources/client`)
```bash
npm run dev       # vite --host, port 5173
npm run build     # tsc -b && vite build -> dist/
npm run lint      # eslint .
npm run preview   # vite preview --host --port 3000
```
No test suite is configured for the client (Vitest + React Testing Library is the recommended-but-unimplemented setup per `.github/instructions/client.instructions.md`).

### Database / local stack
```bash
docker-compose up database -d          # Postgres only, port 5432
docker-compose up -d                   # full stack: frontend (5173), backend (3000), db (5432)
docker exec -it gardeReady-database psql -U root -d gardeready
node Sources/database/generate-password-hash.js   # generate a bcrypt hash for seed users
```
SQL files in `Sources/database/initdb/` auto-run on first container start (via `docker-entrypoint-initdb.d`). `Script/database/init-deployment.sql` is the production-deployment variant.

### Production build
A single root `Dockerfile` builds both frontend and backend, then copies the built client `dist/` into `Sources/api/public/` and runs the compiled API (`node Sources/api/dist/app.js`), which serves the SPA and API from one process. Deploys to Railway (`railway.json`, builder: dockerfile).

## Architecture

### Backend — layered/clean architecture
```
app.ts → routes/routes.ts → Controllers → Services → Repositories → Models (Sequelize)
```
- **Controllers** (`Controllers/`): HTTP request/response handling only, wrapped in `express-async-handler` (`asyncHandler`).
- **Services** (`Services/`): business logic; every method returns an `OperationResult` (`Helpers/OperationResult.ts`) — `{success, data}` or `{success: false, error}` — rather than throwing. Controllers branch on `result.success` to pick the HTTP status from `Helpers/HttpCode.ts`.
- **Repositories** (`Repositories/`): the only layer that talks to Sequelize models directly.
- **Models** (`Models/`): Sequelize model definitions. `Models/setupAssociations.ts` wires all associations (`Vehicules.hasMany(Sections)`, self-referential `Sections.hasMany(Sections)` for the parent/child tree, `Sections.hasMany(Elements)`, `Users.belongsTo(Gardes)`, `Gardes.belongsTo(Users)` as responsable). It **must** be called after model init — see `connectDatabase()` in `Utils/Database.ts`.
- DTOs live in `Types/DTO/` and are the expected shape of request bodies/validated input.

### Data model
- `Vehicules` → root `Sections` (`vehicule_id` set, `parent_section_id` NULL) → child `Sections` (`parent_section_id` set, `vehicule_id` NULL, self-referential tree) → `Elements` (leaf equipment items, `section_id`).
- A `Sections` row is a CHECK-constrained XOR: exactly one of `vehicule_id`/`parent_section_id` is set, never both/neither.
- `Users` belong to a `Gardes` (crew) via `garde_id`; a `Gardes` optionally has a `responsable` (FK to `Users`, `ON DELETE SET NULL`).
- **Users ↔ Gardes circular dependency**: a garde needs users, but a garde's `responsable` is a user — resolved by always creating the garde first with `responsable` NULL, then creating/assigning users, then optionally updating `responsable` afterward. Never try to create both in one transaction.
- Gardes are identified and sorted by numeric `numero` (not `name`) — display as "Garde 1", "Garde 2", etc.; always sort/query `ORDER BY numero ASC`.

### Auth
JWT-based: `AuthService.login()` issues a token stored in an httpOnly cookie (secure in production); `Middlewares/AuthMiddleware.ts` validates it on protected routes. Route protection also distinguishes `admin` vs plain `user` roles (see `requireAdmin` usage in `routes/routes.ts`), plus a `superAdmin` role that some UI (garde member lists) filters out for non-superAdmins. Passwords are bcrypt-hashed (cost factor 12).

### Frontend — layered React SPA
```
Pages → Components → hooks → App/utils/Api (axios)
```
- `App/Provider/`: React contexts (User, Admin, Toast).
- `App/Routes/`: route table; `PrivateRoute` gates authenticated pages by reading/decoding the JWT cookie.
- `App/utils/Api/`: one file per REST resource wrapping a shared `axios` instance (`withCredentials: true` so the auth cookie is sent).
- `hooks/`: TanStack Query mutation hooks per resource (e.g. `useGardeMutations`, `useElementMutations`) — always invalidate the relevant query key(s) `onSuccess`. Deleting a garde must invalidate both `["gardes"]` and `["users"]` since users reference gardes.
- Styling: Tailwind CSS 4 + DaisyUI 5 components (`btn`, `card`, etc.); SASS only for custom transitions not covered by Tailwind.
- The Admin panel (`Pages/Admin/`) merges garde and user management into a single "Gardes" tab (`Pages/Admin/GardesUsers/`) — crews are displayed as cards grouped by garde, with an "unassigned users" card for users with no `garde_id`.

### Cross-cutting: logging
Custom `Logger` class, not `console.log`:
```typescript
import { createLogger } from '~~/Utils/Logger';        // backend
import { createLogger } from '../App/utils/Logger';    // frontend
const logger = createLogger('ModuleName');
logger.debug(...) / logger.info(...) / logger.warn(...) / logger.error(...) / logger.success(...)
```
Level controlled by `LOG_LEVEL` (backend) / `VITE_LOG_LEVEL` (frontend) env vars. Full reference: `docs/LOGGING.md`.

## Conventions
- Never use `sequelize.sync({ force: true })` — it drops and recreates all tables. `alter: true` is likewise avoided in production; schema changes for prod should go through raw SQL / Sequelize CLI migrations.
- Every FK cascades `ON DELETE CASCADE` except `gardes.responsable`, which is `ON DELETE SET NULL` — deleting a responsable's user account does not delete the garde.
- Frontend env vars must be prefixed `VITE_` to be exposed to client code (`import.meta.env.VITE_*`).
- Do not create Markdown files documenting changes unless explicitly requested; if requested, place them under `docs/changes/`.

## Claude Code workflow (temporary, until told otherwise)
- Make code changes directly on `main` — do not create a branch or worktree for them.
- Do not `git commit`, `git push`, or open a PR automatically after making changes. Leave changes uncommitted in the working tree and tell the user what changed; they will review and commit themselves.
