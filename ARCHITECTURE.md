# Architecture

## Overview

GDDS Portal is a web application for discovering datasets through the Federated Catalogue API.

The repository consists of four main areas:

```text
                    ┌───────────────┐
                    │   Angular UI  │
                    │   ui/         │
                    └───────┬───────┘
                            │ HTTP
                            ▼
                    ┌───────────────┐
                    │ FastAPI API   │
                    │ backend/      │
                    └───┬─────┬─────┘
                        │     │
              ┌─────────┘     └──────────┐
              ▼                          ▼
       ┌─────────────┐            ┌─────────────┐
       │ PostgreSQL  │            │    Solr     │
       └─────────────┘            └─────────────┘
```

Additional integrations include OIDC authentication, STOMP messaging, recommender services, Sentry, EOSC services and iSHARE connector discovery.

## Repository structure

### `backend/`

Python 3.10 application built with FastAPI.

Main responsibilities:

- HTTP API
- authentication and OIDC integration
- database access
- database migrations
- Solr integration
- recommender integration
- external service integrations
- user/session handling
- business logic

The backend uses:

- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL
- Uvicorn
- Pipenv

Backend tests are located under `backend/tests/`.

### `ui/`

Angular 17 application using Nx.

Main responsibilities:

- dataset discovery UI
- search
- filtering and navigation
- dataset details
- recommendations
- authentication-related UI flows
- interaction with the backend API

The Nx workspace uses `ui` as its default project.

Important commands:

```bash
cd ui

npm start
npm run build
npm test
npm run lint:fix
```

Generated environment configuration is created automatically by the `generate:vars` script. Do not edit generated environment files manually.

### `solr/`

Contains Solr configuration and collection setup.

Solr runs with ZooKeeper in the local Docker setup.

Important areas:

```text
solr/
└── config/
    └── configsets/
```

When changing Solr schema/configuration, inspect the relevant configset rather than modifying application code first.

### `docker-compose.yml`

Defines the local development infrastructure.

The main services are:

- `api`
- `db`
- `solr1`
- `zoo1`

The API runs on port `8000`.

Solr runs on port `8983`.

PostgreSQL runs on port `5432` in the current compose configuration.

## Backend request flow

Typical request:

```text
Angular
   │
   ▼
FastAPI endpoint
   │
   ├── authentication/session
   │
   ├── business logic
   │
   ├── PostgreSQL
   │
   └── Solr / external service
   │
   ▼
API response
   │
   ▼
Angular
```

When modifying an API endpoint, inspect:

1. backend route
2. backend service/business logic
3. schemas/models
4. database or Solr access
5. frontend API client/service
6. frontend consumers

Do not assume an API change is backend-only.

## Database

PostgreSQL stores application data.

SQLAlchemy models and Alembic migrations are maintained in the backend.

After changing a database model:

1. inspect existing migrations
2. determine whether a migration is required
3. update the migration if required
4. run the relevant backend tests

Do not silently modify the database schema without a migration.

## Solr

Solr is used for search and retrieval of indexed research outcomes/datasets.

Solr configuration is versioned under `solr/config/configsets`.

Local Solr is started together with ZooKeeper:

```bash
docker compose up -d solr1 zoo1
```

The repository documentation contains commands for creating collections, uploading configsets and seeding data.

## Authentication

The backend integrates with OIDC/AAI.

Authentication involves server-side sessions and backend configuration.

Treat authentication flows as security-sensitive.

Before modifying authentication:

- trace the complete request flow
- inspect session handling
- inspect frontend redirects
- inspect environment variables
- check existing tests

Do not replace an existing authentication mechanism with local/browser-only state without explicit requirements.

## External services

The application can integrate with:

- EOSC Marketplace
- EOSC Commons
- OpenAIRE Explore
- Knowledge Hub
- recommender services
- STOMP
- Sentry
- iSHARE Participant Registry / connector discovery

External URLs and credentials are configured through environment variables.

Do not hard-code credentials or environment-specific secrets.

## Deployment

The repository uses Docker Compose for the local environment.

Release automation uses Release Please.

Release-related changes should follow the existing repository workflow described in `README.md`.

## Change strategy

For a normal feature or bug fix:

```text
Understand
    ↓
Locate relevant component
    ↓
Inspect nearby implementation/tests
    ↓
Make minimal change
    ↓
Run targeted tests/lint
    ↓
Review diff
```

Avoid repository-wide refactoring unless explicitly requested.
