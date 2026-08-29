# Software Architecture and Project Conventions (Next.js)

This document describes the software architecture and folder structure used in this project, standardized for our Next.js developments.

The main objective is to achieve a **scalable, maintainable, and decoupled** codebase. To do this, we use a combination of **Module Pattern** (separation by business domains) and **Feature Pattern** (a semantic evolution of the Container/Presentational pattern).

## 🏗️ Core Concepts

1. **Framework Agnosticism:** Business logic and main views should not know if we are using Next.js App Router or Pages Router. The router only serves as an entry point.
2. **Module Pattern:** Code is vertically divided by "Domains" or "Modules" (e.g., `Auth`, `Budget`, `Portfolio`). Each module is an independent micro-ecosystem.
3. **Feature Pattern (Smart/Dumb):**
   - **Features (Smart):** Intelligent components that handle state, perform data fetching, use complex hooks, and orchestrate the UI.
   - **Components (Dumb/Presentational):** "Dumb" components that only receive `props` and emit events (`callbacks`). They have no idea where the data comes from.

---

## 📂 Folder Structure

The main folder is `src/` and is divided into three large layers, plus an external folder for E2E tests:

```text
src/
├── app/          # 1. Routing Layer (Next.js)
├── core/         # 2. Global / Shared Layer
└── modules/      # 3. Domain / Business Layer
tests/
└── e2e/          # End-to-end tests and critical flows (Playwright)
```

### 1. Routing Layer (`src/app/`)

This is the outermost layer. It belongs exclusively to Next.js.

- **Responsibility:** Define routes, layouts, metadata (SEO), and handle server endpoints (API Routes).
- **Golden Rule:** **NO** business logic or complex UI goes here. Pages (`page.tsx`) must be as thin as possible, limited to receiving URL parameters and rendering a `Feature` of the corresponding module.

### 2. Shared Layer (`src/core/`)

Contains all the code that is **transversal to the entire application** and agnostic to any specific business domain.

- `components/`: Generic UI components (buttons, inputs, modals). Usually managed with libraries like shadcn/ui.
- `hooks/`: Global custom hooks (e.g., `use-mobile`, `use-toast`).
- `lib/` / `utils/`: Generic utility functions, date formatters, library configuration.
- `layout/`: Structural components of the app (Navbar, Sidebar, Footer).
- `data/` or `services/`: Database clients or global services (e.g., `supabaseClient`).

### 3. Domain Layer (`src/modules/`)

It is the heart of the application. Here, code is grouped by business context (e.g., `Budget`, `Auth`, `Reports`).

Each module has its own encapsulated internal structure:

```text
src/modules/Budget/
├── __tests__/      # Local unit and integration tests
├── components/     # Dumb components (module-specific UI)
├── features/       # Smart components (Orchestrators)
├── hooks/          # Module-specific React logic
├── services/       # Communication with external APIs or database
├── types/          # TypeScript interfaces and types
└── utils/          # Module helper functions
```

#### Anatomy of a Module:

- **`features/` (Smart Components):**
  They are the entry points for the pages. A feature (e.g., `BudgetBoard.tsx`) is in charge of calling the fetching hooks (`useBudgetData`), handling loading/error states, and passing clean data to the child components.
- **`components/` (Dumb Components):**
  Purely visual components (e.g., `ExpenseItem.tsx`, `CategoryBadge.tsx`). They receive `data` and invoke functions like `onDelete`, `onUpdate`. They are highly testable and predictable.
- **`services/`:**
  Asynchronous functions that communicate with the backend/BFF (`api/`) or services (Supabase, Firebase, etc.). No component should make a direct `fetch` without going through a service.
- **`hooks/`:**
  If a `Feature` has a lot of state logic or requires processing multiple service calls, that logic is extracted to a custom hook within the module (e.g., `useExpenseCrud.ts`).

---

## 🔄 Data Flow and Dependency Rules

To keep the architecture clean, there are strict rules about what can import what:

1. **Page Rule:** Files in `src/app` can **only** import from `features/` (from modules) or layouts from `core/`.
2. **Module Rule:**
   - A module should not import things from the internal folder of another module. If two modules need to share something, that something probably belongs in `src/core/`.
   - If a module needs to use a "Feature" from another module, it must import it by its public interface (the Feature file itself), but avoiding circular coupling.
3. **Feature Rule:** A `Feature` imports `components`, `hooks`, and `services` from its own module, and base components from `core/`.
4. **Component Rule (Dumb):** `components/` within a module **CANNOT** import from `features/`, `hooks/`, or `services/`. They are pure components.

## 💡 Flow Example:

1. The user enters `/admin/budgets`.
2. `src/app/admin/budgets/page.tsx` renders `<BudgetBoard />`.
3. `BudgetBoard` (in `src/modules/Budget/features/`) calls the `useBudgetData` hook.
4. `useBudgetData` interacts with `expenses.services.ts`.
5. Once the data arrives, `BudgetBoard` renders dumb components like `<ExpensesBoard expenses={data} />` and `<ExpenseItem />` passing the necessary callbacks.
