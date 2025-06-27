# 📘 Technical Specification: Cross-Platform React Application with Backend-Managed State (Electron + Web)

---

## 🧭 Overview

This project is a **modular, type-safe, and testable monorepo** designed to run a React application across:

* 🖥 **Electron (desktop)** with Node.js backend and IPC
* 🌐 **Web browser** with local in-memory state backend

The React UI is **purely declarative and view-focused**:

* All application state is **exclusively owned and managed by the backend**
* The UI **dispatches typed actions** and **subscribes to backend state updates**
* **State access and reactivity** are handled through a **type-safe `BackendAPI`** interface injected at runtime

---

## 📁 Project Structure

```
/apps
  /electron-app         → Electron runtime: main, preload, renderer
  /web-app              → Web runtime: React entry
/packages
  /shared               → TypeScript shared types: AppState, Action, BackendAPI
  /ui                   → React UI + AppContext, hooks
  /backend-web          → Web backend implementation (local state only)
  /backend-electron     → Electron backend implementation using IPC
```

---

## 💡 Core Design Principles

| Principle             | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| 🧠 Centralized State  | All state lives in the backend, not in React components      |
| 🧩 Pluggable Backend  | Backend implementations conform to a shared `BackendAPI`     |
| 🔄 Action-Based Logic | UI dispatches actions instead of setting state directly      |
| ⚡ Reactive UI         | UI subscribes to state slices and re-renders on change       |
| 🧪 Fully Testable     | Backend and UI layers are independently and jointly testable |
| 🧼 Clean Separation   | Shared types and pure UI layer decoupled from runtime        |

---

## 🧾 API Contracts

```ts
// packages/shared/api.ts

export interface AppState {
  counter: number;
}

export type Action =
  | { type: 'incrementCounter' }
  | { type: 'resetApp' };

export interface StateSubscription<T> {
  getValue(): Promise<T>;
  subscribe(callback: (value: T) => void): () => void;
}

export interface BackendAPI {
  dispatch(action: Action): Promise<void>;
  select<K extends keyof AppState>(
    key: K
  ): StateSubscription<AppState[K]>;
  getState(): Promise<AppState>;
}
```

---

## 💻 UI Layer (`packages/ui`)

The React UI is wrapped with an `AppProvider` that accepts any `BackendAPI`.

### Key Components

#### `AppProvider`

```ts
<AppProvider backend={someBackend}>
  <App />
</AppProvider>
```

#### `useBackend()`

A hook to access the injected `BackendAPI`.

#### `useReactiveSelector(key)`

A hook that:

* Subscribes to a specific key in `AppState`
* Re-renders the component on value change

### `App.tsx` Example

```tsx
const counter = useReactiveSelector('counter');
const backend = useBackend();

return (
  <button onClick={() => backend.dispatch({ type: 'incrementCounter' })}>
    Clicked {counter} times
  </button>
);
```

---

## 🧩 Backend Implementations

### ✅ `backend-electron`

* Uses `contextBridge` in preload to expose `BackendAPI` to renderer
* Main process holds state and emits updates via `EventEmitter`
* IPC channels: `'dispatch'`, `'select'`, `'getState'`

### ✅ `backend-web`

* Uses **local in-memory state** (no HTTP or fetch)
* Simulates subscriptions and updates using local function registry
* Suitable for demonstrating backend injection in a web-only setup

---

## 🔧 Runtime Entry Points

### Electron (`apps/electron-app/renderer.tsx`)

```tsx
<AppProvider backend={window.api}>
  <App />
</AppProvider>
```

### Web (`apps/web-app/index.tsx`)

```tsx
<AppProvider backend={webBackend}>
  <App />
</AppProvider>
```

---

## 🧪 Testing Strategy

* Uses [`vitest`](https://vitest.dev) and [`@testing-library/react`](https://testing-library.com)
* Test suites per backend + UI

| Layer              | Location                    | Tests                                   |
| ------------------ | --------------------------- | --------------------------------------- |
| `backend-electron` | `__tests__/backend.test.ts` | dispatch, state update, subscriptions   |
| `backend-web`      | `__tests__/backend.test.ts` | action simulation, local subscription   |
| `ui`               | `__tests__/App.test.tsx`    | full UI integration with mocked backend |

### Run All Tests

```bash
pnpm install
pnpm test
```

---

## 🛠 Build System

### Uses:

* **PNPM** for workspace management
* **Turborepo** for build/test orchestration and caching
* **Vite** for frontend bundling
* **Electron Builder** for app packaging (not yet configured, optional)

### Key Commands

| Task             | Command                          |
| ---------------- | -------------------------------- |
| Install all deps | `pnpm install`                   |
| Build all        | `pnpm build`                     |
| Start Electron   | `pnpm --filter electron-app dev` |
| Start Web        | `pnpm --filter web-app dev`      |
| Test All         | `pnpm test`                      |

---

## ⚙️ Workspace Configuration

### `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

### `turbo.json`

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**"]
    },
    "test": {
      "outputs": []
    },
    "dev": {
      "cache": false
    }
  }
}
```

---

## 🚀 Deployment Notes

* **Web App**: build `web-app` with Vite → deploy static output
* **Electron App**: package via Electron Builder (optional task)
* **UI** remains completely **runtime-agnostic**

---

## ✅ Agent Deliverables

* [ ] Clone repo or use scaffold
* [ ] Implement all package stubs
* [ ] Confirm API contracts match
* [ ] Add tests and verify output
* [ ] Document runtime instructions and assumptions

---

## 🔮 Future Extensions (Optional)

| Feature                            | Benefit                             |
| ---------------------------------- | ----------------------------------- |
| WebSocket-based backend (web)      | Real-time state sync                |
| File or DB persistence (Electron)  | Save app state between runs         |
| More actions (addItem, removeItem) | Exercise dispatch patterns          |
| Time travel/debug logging          | Redux DevTools-like backend tracing |

---

Let me know if you'd like this documentation also saved into a downloadable Markdown file (`TECHNICAL_SPEC.md`) or embedded inside the zip project for handoff.
