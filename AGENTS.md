# AGENTS.md — SDD Team Protocol & Architecture Standard

> This file is the ONLY source of architectural truth. Agents MUST fail if asked to break these rules.

## 🛠️ PROJECT STANDARDS (Mandatory)

- **Package Manager:** `pnpm` is the ONLY package manager allowed. Do NOT use `npm`, `npx`, or **`yarn`**.
- **Execution:** Use `pnpm run <script>`, `pnpm exec <command>`, or `pnpx <command>`.

### Primary Commands

- **`pnpm dev`**: Starts the Next.js development server.
- **`pnpm build`**: Creates a production build.
- **`pnpm lint`**: Runs ESLint to find style and quality issues.
- **`pnpm format`**: Formats all code using Prettier. Run this before committing.
- **`pnpm check-types`**: Runs the TypeScript compiler to validate types without generating code.
- **`pnpm test:e2e`**: Runs the end-to-end tests using Playwright.

## 🏗️ CORE ARCHITECTURE (Module & Feature Pattern)

Based on `ARCHITECTURE.md`, the project is divided into 3 layers with unidirectional flow:

### 1. Routing Layer (`src/app/`)

- **Responsibility:** Routes, Next.js Layouts, and Metadata.
- **GOLDEN RULE:** "Thin" pages. They only receive params and render a **Feature** from a module. Complex logic or UI is strictly forbidden here.
- **Imports:** Only from `src/modules/[domain]/features` or `src/core/layout`.

### 2. Global Layer (`src/core/`)

- **`components/`**: Generic UI (Design System / shadcn).
- **`layout/`**: Structural components (Navbar, Sidebar, Footer).
- **`hooks/`, `lib/`, `utils/`**: Business-agnostic logic.
- **`services/`**: Global clients (e.g., `supabaseClient`).

### 3. Domain Layer (`src/modules/[Domain]/`)

Each module is an encapsulated micro-ecosystem:

- **`features/` (Smart):** Orchestrators. They handle state, fetching (hooks), and services. Entry points for `app/`.
- **`components/` (Dumb):** Domain-specific UI. They only receive props and emit callbacks. **FORBIDDEN** to import hooks or services here.
- **`hooks/` & `services/`:** Domain-specific logic and asynchronous communication.
- **`types/` & `utils/`:** Local definitions and helpers.

## 🚀 SDD Workflow (8 Specialists)

1.  **orchestrator (Tech Lead):** Plans and delegates. NEVER codes. **MANDATE:** Challenge the user's assumptions; do not just agree.
2.  **product-manager (Discovery):** Conducts discovery with the user and drafts the PRD in `docs/product/features/`.
3.  **explorer (Codebase Mapper):** Maps the current codebase, identifies patterns, and reports dependencies to the Architect.
4.  **architect (SDD Expert):** Designs the RFC based on the PRD and Exploration report. Defines Modules, Core utilities, and Data contracts.
5.  **planner (Task Generator):** Breaks down the RFC into atomic, executable tasks for the Coders.
6.  **frontend-coder (Smart/Dumb UI):** Implements the UI. Strictly separates Smart (features) from Dumb (components). **Includes Unit/Integration tests.**
7.  **backend-coder (Logic & DB):** Implements Server Actions and Services. Forbidden to touch visual `.tsx`. **Includes Unit/Integration tests.**
8.  **auditor (Integrity Gate):** Cross-audits PRD vs RFC vs Code. Verifies DDD and Smart/Dumb compliance.
9.  **tester-e2e (Critical Flows):** Develops full E2E flows (Playwright) in `tests/e2e/`.
10. **debugger:** Investigates root cause of bugs using logs and Chrome DevTools.
11. **seo-docs:** Audits SEO in `src/app` and documents public interfaces.

## 🔄 Dependency Rules

- A module does not import internal folders from another module (use `src/core` if shared).
- Dumb components DO NOT import logic/hooks/services.
- Pages in `src/app` are simple shells for `features`.

## 📝 Code Style & Conventions

- **Formatting:** Code is formatted with `Prettier` using the project's configuration. Always run `pnpm format` before committing changes.
- **Linting:** `ESLint` is used for code quality. Rules are defined in `.eslintrc.js` and are based on `next/core-web-vitals`. Run `pnpm lint` to check for issues.
- **Typing:** The project is 100% TypeScript. `any` is forbidden. Use specific types, infer from Zod schemas, or use `unknown` for safe type casting.
- **Naming:**
  - Components: `PascalCase` (e.g., `WorkoutCard.tsx`).
  - Hooks: `use` prefix (e.g., `useAuth.ts`).
  - Services/Utilities: `camelCase` (e.g., `userService.ts`).
- **Error Handling:** Services and data-fetching functions should handle potential errors gracefully, returning a consistent `{ data, error }` object structure where possible.

## 🧪 Testing Strategy

- **Unit/Integration Tests:** Each module should contain a `__tests__` directory for its specific tests. The command `pnpm test` should be configured to run these (NOTE: currently not defined in `package.json`).
- **End-to-End (E2E) Tests:** Critical user flows are tested with Playwright. These tests reside in `tests/e2e/` and are executed with `pnpm test:e2e`.

## 🛑 UNIVERSAL RULE: Engram Tollbooth

**Every execution MUST begin by reading the session context in Engram (`mem_search` / `mem_get_observation`).**
Upon finishing your work, you are STRICTLY FORBIDDEN from returning control without first executing `mem_save` with a 2-line summary of decisions made or delegated files. Engram is a mandatory toll.
