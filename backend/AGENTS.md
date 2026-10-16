# Backend instructions

## Stack

- Python 3.10
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- PostgreSQL
- Uvicorn
- Pipenv
- pytest

Dependencies are defined in `Pipfile`.

## Structure

The backend contains:

- `app/` - application code
- `tests/` - tests
- `alembic/` - database migrations
- `Dockerfile` - backend container

## Development

Install dependencies:

```bash
pipenv install
```

Run the application:

```bash
pipenv run uvicorn app.main:app --reload
```

Run migrations:

```bash
pipenv run alembic upgrade head
```

Run tests:

```bash
PIPENV_DONT_LOAD_ENV=1 ENVIRONMENT=test pipenv run pytest
```

Skip integration tests:

```bash
ENVIRONMENT=test SOLR_URL=http://localhost:8993/solr/ pipenv run pytest -m "not integration"
```

## Code quality

Existing project commands:

```bash
pipenv run --experimental-string-processing black alembic app tests
pipenv run isort .
pipenv run pylint app tests
```

Follow the existing formatting and import conventions.

## API changes

When changing an endpoint:

1. Find the route.
2. Follow the called service/business logic.
3. Inspect request/response schemas.
4. Check database/Solr dependencies.
5. Find existing tests.
6. Update tests with the smallest useful coverage.

Do not change API response formats unnecessarily.

## Database changes

SQLAlchemy model changes may require Alembic migrations.

Migration generation:

```bash
pipenv run alembic revision --autogenerate -m "<revision message>"
```

Do not modify existing historical migrations unless explicitly requested.

Prefer adding a new migration.

## Solr

Do not duplicate Solr query logic in multiple places if an existing abstraction already exists.

When changing Solr queries:

- inspect the existing query builder/service
- check field names against the Solr schema
- check existing tests
- consider pagination and result limits

## External integrations

Treat OIDC, STOMP, recommender and iSHARE integrations as integration boundaries.

Prefer keeping external-service communication isolated from core business logic.

Do not hard-code URLs, credentials or secrets.

## Tests

Prefer targeted tests first.

For a change in one module, do not run the entire integration suite unless necessary.

When fixing a bug, add or update a regression test when practical.

## Minimal-change rule

Do not refactor unrelated backend code while implementing a feature or bug fix.

Do not introduce a new framework, dependency or architectural layer without a clear requirement.
