# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

zoonotify-client is a React/TypeScript SPA for querying zoonosis surveillance data. It connects to a Strapi-based REST API and displays data via charts, tables, and filter interfaces.

## Commands

```bash
# Development
npm start              # Start dev server (cleans, copies assets, starts webpack-dev-server)
npm start:qa           # Dev server for QA environment
npm start:prod         # Dev server for production environment

# Build
npm run build          # Production build → public/
npm run build:qa       # QA build
npm run build:prod     # Production build (explicit)

# Code quality
npm run lint           # ESLint
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier format

# Tests
npm test                               # Run all Jest tests
npm run test:coverage                  # With coverage report
npm test -- path/to/file.test.tsx      # Single test file
npm test -- -t "test name"            # Single test by name
```

## Architecture

### Module-per-Feature Structure

Each feature is a self-contained directory under `src/app/`:

```
src/app/
├── shared/                     # Cross-feature utilities
│   ├── infrastructure/api/     # callApiService<T>() — generic typed fetch wrapper
│   ├── infrastructure/router/  # Route config (routes.ts) and BodyRouterComponent
│   ├── model/                  # Shared TypeScript interfaces (CMS, API, filter models)
│   └── style/                  # MUI theme (Style-MainTheme.ts)
├── evaluations/                # Each feature follows this pattern:
│   ├── pages/                  #   Main page component + page-level use case hook
│   ├── components/             #   Sub-components + DataContext (React Context provider)
│   ├── model/                  #   Feature-specific types and constants
│   └── utils/
├── prevalence/
├── antibiotic_resistance/
├── antimicrobial/
├── microbial_counts/
├── explanation/
├── welcome/
└── pages/                      # Static pages (data_protection, error, links)
```

### Data Flow

1. **Context Provider** (e.g., `EvaluationDataContext.tsx`) fetches from API on mount and holds state
2. **Use Case Hook** (e.g., `evaluationsPageUseCases.ts`) derives view model from context state and returns `{ model, operations }`
3. **Page Component** calls use case hook, passes `model` and `operations` to sub-components
4. **Shared API service** (`callApiService<T>()`) wraps `fetch` with typed `ApiResponse<T>` returns

### State Management

- React Context API scoped per feature — no Redux
- URL query parameters persist filter selections and language for deep-linking
- Session storage holds CMS version info

### Routing

Routes are defined in `src/app/shared/infrastructure/router/routes.ts`. The `REACT_APP_SHOW_LD` env var controls visibility of the `/ld` (Linked Data) route.

Key routes: `/`, `/evaluations`, `/prevalence`, `/antibiotic-resistance`, `/antimicrobial`, `/microbial-counts`, `/explanations`, `/ld`, `/links`, `/dataProtectionDeclaration`

### Internationalization

- i18next with `react-i18next`; translation JSON files in `src/locales/{de,en}/`
- Language persisted in URL query parameter (`?lang=de`)
- `src/i18n.ts` is the i18next configuration entry point

### Styling

- MUI v5 with Emotion CSS-in-JS
- Theme customization in `src/app/shared/style/Style-MainTheme.ts`

### Environment Variables

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_ENV` | Environment name (dev/qa/production) |
| `REACT_APP_SHOW_LD` | Enable Linked Data page |

Environment files: `.env`, `.env.qa`, `.env.production` — loaded by dotenv-webpack.

### Build Output

Webpack builds to `public/`. The `prebuild` script runs `clean` automatically. Static assets and locale files are copied via `cp:*` scripts (run as part of `start`/`build`).

## Key Conventions

- **File naming**: `ComponentName.component.tsx` for components, `featureNameUseCases.ts` for hooks, `*.model.ts` for type definitions
- **Use case hooks** return `{ model, operations }` — model for rendering, operations for user interactions
- **`no-explicit-any` is an ESLint error** — always use proper TypeScript types
- **Absolute imports** are configured via `baseUrl: "./src"` in tsconfig
- **Canvas mocking** is set up in `setupTests.js` via `jest-canvas-mock` — required for chart component tests
- **Webpack dev proxy**: `/v1` and `/api-docs` are proxied to `http://localhost:3000`
