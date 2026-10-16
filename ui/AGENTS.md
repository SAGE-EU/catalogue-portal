# Frontend instructions

## Stack

- Angular 17
- Nx 17
- TypeScript 5.2
- RxJS
- SCSS
- Bootstrap
- ng-bootstrap
- ng-zorro

The workspace uses Nx with `ui` as the default project.

## Important

All frontend commands must be run from this directory:

```bash
cd ui
```

Do not run frontend commands from the repository root unless the command explicitly requires it.

## Development

Install dependencies:

```bash
npm i --force
```

Run development server:

```bash
npm start
```

Run with external proxy configuration:

```bash
npm run start:external
```

Build:

```bash
npm run build
```

Tests:

```bash
npm test
```

Lint and formatting:

```bash
npm run lint:fix
```

## Project structure

The main Angular application is under:

```text
apps/ui/
```

When implementing a UI change, start by locating the relevant feature under the application source tree.

Do not inspect `node_modules/` unless there is a specific dependency-debugging task.

## Environment configuration

Environment variables prefixed with `NG_` are converted into the generated Angular environment file.

The generated file is:

```text
apps/ui/src/environments/environment.generated.ts
```

It is generated automatically by the `generate:vars` script.

Never edit this file manually.

Environment generation runs automatically before:

```bash
npm start
npm run build
```

## Angular conventions

Follow existing Angular patterns in the surrounding code.

Before creating a new:

- service
- component
- state store
- utility
- shared abstraction

search for an existing implementation first.

Prefer existing application services and state management patterns over introducing new ones.

## API integration

When changing frontend behaviour that depends on an API:

1. Find the existing frontend service/client.
2. Inspect the backend endpoint.
3. Check request and response types.
4. Update both sides only when necessary.
5. Update relevant tests.

Do not duplicate backend business logic in the UI.

## State management

The project uses `@ngneat/elf`.

When modifying stateful features, inspect the existing store, repository and request patterns before introducing new state.

Do not introduce another state-management mechanism.

## Templates

Keep Angular templates simple.

Prefer moving non-trivial logic into TypeScript rather than adding complex expressions to templates.

Preserve existing internationalization/translation patterns.

## Styling

Follow the existing SCSS and Bootstrap/ng-bootstrap patterns.

Do not introduce a new CSS framework or component library.

## Testing

Use the existing Nx/Jest/Cypress setup.

Prefer targeted tests for the affected feature.

Do not run the entire workspace test suite for a small isolated change unless required.

## Generated and dependency files

Do not manually edit:

- `node_modules/`
- generated environment files
- generated build output
- lockfiles unless dependency changes require them

## Minimal-change rule

Do not perform broad Angular/Nx refactoring when implementing a focused feature or bug fix.

Keep changes local to the affected feature whenever possible.
