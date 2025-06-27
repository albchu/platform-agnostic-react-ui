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
* **Vite** for frontend bundling (development and production)
* **Electron Builder** for production app packaging and distribution
* **TypeScript** for type checking and compilation
* **ESLint + Prettier** for code quality and formatting

### Development Commands

| Task             | Command                          |
| ---------------- | -------------------------------- |
| Install all deps | `pnpm install`                   |
| Build all        | `pnpm build`                     |
| Start Electron   | `pnpm --filter electron-app dev` |
| Start Web        | `pnpm --filter web-app dev`      |
| Test All         | `pnpm test`                      |
| Lint All         | `pnpm lint`                      |
| Type Check       | `pnpm type-check`                |

### Production Build Commands

| Task                    | Command                                  | Output                                    |
| ----------------------- | ---------------------------------------- | ----------------------------------------- |
| Build Web (Production)  | `pnpm build:web`                        | `apps/web-app/dist/` (static files)      |
| Build Electron (Prod)   | `pnpm build:electron`                   | `apps/electron-app/dist/` (executable)   |
| Build All (Production)  | `pnpm build:prod`                       | Both web and electron production builds  |
| Package Electron        | `pnpm package:electron`                 | Platform-specific installers             |
| Release Electron        | `pnpm release:electron`                 | Signed, notarized, and published builds  |

### Build Optimization Features

#### Web App Production Build
* **Tree shaking** and **dead code elimination**
* **Code splitting** with dynamic imports
* **Asset optimization** (images, fonts, CSS)
* **Bundle size analysis** and optimization
* **Service worker** for offline capabilities (optional)
* **Environment-specific configurations**

#### Electron Production Build
* **Code signing** for Windows, macOS, and Linux
* **Auto-updater** integration
* **Platform-specific optimizations**
* **Installer generation** (NSIS, DMG, AppImage, etc.)
* **Notarization** for macOS
* **Multi-platform builds** from single command

---

## ⚙️ Workspace Configuration

### `pnpm-workspace.yaml`

```yaml
packages:
  - apps/*
  - packages/*
```

### Root `package.json` Scripts

```json
{
  "scripts": {
    "build": "turbo run build",
    "build:prod": "turbo run build:prod",
    "build:web": "turbo run build --filter=web-app",
    "build:electron": "turbo run build:prod --filter=electron-app",
    "package:electron": "turbo run package --filter=electron-app",
    "release:electron": "turbo run release --filter=electron-app",
    "dev": "turbo run dev",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean && rm -rf node_modules/.cache"
  }
}
```

### Enhanced `turbo.json`

```json
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", "build/**", "lib/**"]
    },
    "build:prod": {
      "dependsOn": ["^build", "type-check", "lint"],
      "outputs": ["dist/**", "build/**", "release/**"],
      "env": ["NODE_ENV", "VITE_*", "ELECTRON_*"]
    },
    "package": {
      "dependsOn": ["build:prod"],
      "outputs": ["release/**", "dist/**"]
    },
    "release": {
      "dependsOn": ["package"],
      "outputs": ["release/**"],
      "env": ["GH_TOKEN", "APPLE_*", "CSC_*", "WIN_CSC_*"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Web App Build Configuration (`apps/web-app/vite.config.ts`)

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? './' : '/',
  build: {
    outDir: 'dist',
    sourcemap: mode === 'development',
    minify: mode === 'production' ? 'esbuild' : false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@workspace/ui']
        }
      }
    },
    target: 'es2020'
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
}));
```

### Electron Build Configuration (`apps/electron-app/electron-builder.json`)

```json
{
  "appId": "com.yourcompany.yourapp",
  "productName": "Your App Name",
  "directories": {
    "output": "release",
    "buildResources": "build-resources"
  },
  "files": [
    "dist/**/*",
    "node_modules/**/*",
    "package.json"
  ],
  "extraMetadata": {
    "main": "dist/main.js"
  },
  "mac": {
    "category": "public.app-category.productivity",
    "hardenedRuntime": true,
    "gatekeeperAssess": false,
    "entitlements": "build-resources/entitlements.mac.plist",
    "entitlementsInherit": "build-resources/entitlements.mac.plist",
    "target": [
      {
        "target": "dmg",
        "arch": ["x64", "arm64"]
      },
      {
        "target": "zip",
        "arch": ["x64", "arm64"]
      }
    ]
  },
  "win": {
    "target": [
      {
        "target": "nsis",
        "arch": ["x64", "ia32"]
      },
      {
        "target": "portable",
        "arch": ["x64", "ia32"]
      }
    ],
    "certificateFile": "path/to/certificate.p12",
    "certificatePassword": "${env.WIN_CSC_KEY_PASSWORD}"
  },
  "linux": {
    "target": [
      {
        "target": "AppImage",
        "arch": ["x64"]
      },
      {
        "target": "deb",
        "arch": ["x64"]
      }
    ],
    "category": "Office"
  },
  "publish": {
    "provider": "github",
    "owner": "your-github-username",
    "repo": "your-repo-name"
  },
  "afterSign": "scripts/notarize.js"
}
```

## 🔧 Development Workflow

### Quality Gates
* **TypeScript strict mode** enabled
* **ESLint** with React and accessibility rules
* **Prettier** for consistent formatting
* **Unit tests** with minimum coverage thresholds
* **Bundle size limits** to prevent bloat
