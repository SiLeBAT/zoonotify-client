# zoonotify-client

Web-based interface for querying zoonosis surveillance data. A React/TypeScript SPA that connects to a Strapi-based REST API and displays data via charts, tables, and filter interfaces.

## Prerequisites

- Node.js (LTS recommended)
- npm

## Getting Started

```bash
npm install
npm start
```

The app proxies `/v1` and `/api-docs` to `http://localhost:3000` (the backend API).

## Scripts

| Command | Description |
|---|---|
| `npm start` | Start dev server (dev environment) |
| `npm run start:qa` | Start dev server (QA environment) |
| `npm run start:prod` | Start dev server (production environment) |
| `npm run build` | Production build → `public/` |
| `npm run build:qa` | QA build |
| `npm run build:prod` | Production build (explicit) |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Prettier format |
| `npm test` | Run all Jest tests |
| `npm run test:coverage` | Run tests with coverage report |

## Environment Variables

Create a `.env` file (or `.env.qa` / `.env.production`) with:

| Variable | Purpose |
|---|---|
| `REACT_APP_API_URL` | Backend API base URL |
| `REACT_APP_ENV` | Environment name (`dev` / `qa` / `production`) |
| `REACT_APP_SHOW_LD` | Enable the Linked Data page (`true` / `false`) |

## Architecture

### Module-per-Feature

Each feature lives under `src/app/` as a self-contained directory:

```
src/app/
├── shared/                     # Cross-feature utilities, API service, router, theme
├── evaluations/
├── prevalence/
├── antibiotic_resistance/
├── antimicrobial/
├── microbial_counts/
├── explanation/
├── welcome/
└── pages/                      # Static pages (data protection, error, links)
```

### Data Flow

1. A **Context Provider** fetches from the API on mount and holds state.
2. A **use case hook** derives the view model from context and returns `{ model, operations }`.
3. The **Page Component** calls the hook and passes `model` and `operations` to sub-components.
4. The **shared API service** (`callApiService<T>()`) wraps `fetch` with typed `ApiResponse<T>` returns.

### Key Technologies

- **React 18** + **TypeScript**
- **MUI v5** (Material UI) with Emotion CSS-in-JS
- **Chart.js** / **react-chartjs-2** and **Recharts** for data visualisation
- **i18next** / **react-i18next** for internationalisation (German and English)
- **React Router v5** for client-side routing
- **Webpack 5** for bundling

### Internationalisation

Language is persisted as a URL query parameter (`?lang=de`). Translation files are in `src/locales/{de,en}/`.

## License

MIT — © Michele Kayser, Dominic Tölle, Chinmay Kulkarni, Mahtab Iltarabian
