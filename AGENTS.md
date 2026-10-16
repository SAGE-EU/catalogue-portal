# AGENTS.md

## Project overview

GDDS Portal is a web portal for dataset discovery in the SAGE-EU/GDDS ecosystem.

The repository contains:
- `backend/` - Python/FastAPI backend
- `ui/` - Angular 17 frontend managed by Nx
- `solr/` - Solr configuration and collection setup
- `docker-compose.yml` - local development services

The main data flow is:

UI -> Backend API -> PostgreSQL / Solr / external services

## Repository rules

- Read the relevant local `AGENTS.md` before modifying code in `backend/` or `ui/`.
- Prefer existing patterns and abstractions over introducing new ones.
- Keep changes focused on the requested task.
- Do not perform unrelated refactoring.
- Do not upgrade dependencies unless explicitly requested.
- Do not modify generated files manually.
- Do not change environment-specific configuration or credentials unless explicitly required.
- Never commit secrets, credentials, private keys, `.env` files, or generated environment files.
- Before changing an API contract, inspect both the backend endpoint and its frontend consumers.
- When changing database models, check the corresponding Alembic migrations.
- When changing Solr-related functionality, inspect the relevant configset and collection configuration.
- Preserve existing authentication and authorization behaviour unless the task explicitly changes it.

## How to work

Before making changes:

1. Identify the smallest relevant part of the repository.
2. Read only the files needed to understand the change.
3. Check existing tests and patterns near the code being changed.
4. Implement the smallest reasonable change.
5. Run the most targeted tests, linting, or type checks relevant to the change.

Do not scan the entire repository unless the task genuinely requires repository-wide analysis.

## Important documentation

- `README.md` - development, deployment and service configuration
- `ARCHITECTURE.md` - high-level architecture and component responsibilities
- `backend/AGENTS.md` - backend-specific rules
- `ui/AGENTS.md` - frontend-specific rules

## Commands

Backend:

```bash
docker compose up --build
```

or from `backend/`:

```bash
pipenv install
pipenv run uvicorn app.main:app --reload
```

Frontend:

```bash
cd ui
npm i --force
npm start
```

Frontend build:

```bash
cd ui
npm run build
```

Frontend lint/format:

```bash
cd ui
npm run lint:fix
```

Solr:

```bash
docker compose up -d solr1 zoo1
```

## Output discipline

Avoid producing large command outputs when a targeted command is sufficient.

Prefer:
- targeted `git diff`
- targeted test execution
- targeted file inspection
- filtering logs to the relevant error

Do not dump entire dependency directories, generated files, build output, or large logs into the working context.
