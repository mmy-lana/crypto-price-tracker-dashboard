***

# NEXUS_SYS: Cyberpunk Crypto Price Tracker Dashboard

A responsive, high-performance cryptocurrency price tracking terminal and local asset ledger built with **React 19**, **Vite 8**, **TypeScript 6**, and **Tailwind CSS v4** [3].

Powered directly by the **CoinGecko API** (Demo Plan), the interface features an offline-resilient architecture, dynamic search-to-market pipelines, custom interactive SVG visualization, and local storage state persistence [1].

**🔗 Production Deployment Link:** [https://crypto-price-tracker-dashboard-five.vercel.app/](https://crypto-price-tracker-dashboard-five.vercel.app/)

---

## 🛠️ Tech Stack & Protocols

*   **Compiler & Bundler:** React 19.2.6 + Vite 8.0.12 + TypeScript 6.0.2 [3]
*   **Style Engine:** Tailwind CSS v4.3.1 (utilizing the native `@tailwindcss/vite` plugin) [3]
*   **Data Stream Source:** CoinGecko API v3 (Demo Tier) [1]
*   **Backend Proxy Runtime:** Vercel Node.js Serverless Environment [1.2.6]
*   **Storage Mechanics:** Browser-native `localStorage` for watchlists and transaction ledgers
*   **Visualizations:** Inline responsive vector calculations (zero external plotting dependencies)

---

## ⚡ Core Features

### 1. Unified Serverless API Proxy (Security Hardened)
*   Bypasses client-side API key exposure entirely by routing all data ingestion through a secure backend proxy (`api/coingecko.ts`) [1.2.6].
*   Vercel Serverless routing uses `vercel.json` rewrites to funnel all `/api/*` requests cleanly to the single secure function, keeping the private API key hidden from the browser console [1.2.7].

### 2. Request Deduplication & Cache (Rate-Limit Protection)
*   **Promise Collapsing:** If React or network mounts trigger duplicate simultaneous fetches (such as React Strict Mode during development), the system collapses them into a single active promise to prevent duplicate API hits [1.2.5, 1.2.6].
*   **45s TTL Caching:** Fetched endpoints are cached using an `unknown`-typed local Map, protecting the Demo Plan's **30 requests per minute** limit [1, 1.1.7]. If the API is rate-limited (HTTP `429`), the system seamlessly falls back to local core telemetry (`mockData.ts`).

### 3. Dual-Layout Asset Explorer (Grid & List Viewports)
*   Offers layout options (Grid and List views) to explore top cryptocurrencies.
*   Assets are rendered with mini historical trend indicators mapped directly from raw sparkline coordinates [1].

### 4. Custom Memoized SVG Charting
*   Our timeline chart (`PriceChart.tsx`) compiles coordinate arrays into inline SVG vectors using `useMemo` optimizations.
*   Recalculation occurs only when the timeline dataset changes, guaranteeing lag-free tracking during mouse movements and vertical crosshair snapping.

### 5. Interactive Ledger Portfolio (`CODENAME_LEDGER`)
*   An asset manager that tracks custom entry points using lazy-loading state initializers to prevent cascading re-renders.
*   Uses a safe external constructor to bypass purity issues (`Math.random` / `Date.now`) inside component scopes.

### 6. XSS-Safe Render Pipelines
*   CoinGecko description strings are processed through a native regex tags-stripper to render plain, clean text, eliminating the DOM injection security risks of raw `dangerouslySetInnerHTML`.

---

## 📂 Directory Structure

```text
.
├── api/
│   └── coingecko.ts                # Unified serverless API proxy handler (private credentials)
├── public/
│   ├── favicon.svg                 # System brand asset
│   └── icons.svg
├── src/
│   ├── assets/
│   │   └── styles/
│   │       └── index.css           # Tailwind v4 configuration directives & custom @theme tokens
│   ├── components/
│   │   ├── crypto/
│   │   │   ├── CoinGrid.tsx        # Card display layout
│   │   │   ├── CoinRow.tsx         # Tabular data row display
│   │   │   ├── PriceChart.tsx      # Inline optimized SVG line graph
│   │   │   └── Sparkline.tsx       # Mini zero-dependency list graph
│   │   └── layout/
│   │       ├── MainLayout.tsx      # Main layout coordinator
│   │       ├── Sidebar.tsx         # Sidebar navigation and status footer
│   │       └── Topbar.tsx          # Dynamic diagnostics header
│   ├── context/
│   │   ├── AppContext.ts           # React Context declaration (split for Fast Refresh)
│   │   └── AppProvider.tsx         # State provider component
│   ├── hooks/
│   │   ├── useApp.ts               # Custom global context hook
│   │   └── useCoinGecko.ts         # React Hooks for details, markets, and charts
│   ├── services/
│   │   └── coingecko.ts            # Client service calling the relative /api proxy path
│   ├── utils/
│   │   └── mockData.ts             # Offline telemetry fallback profiles
│   ├── views/
│   │   ├── Dashboard.tsx           # Main explore console and search view
│   │   ├── CoinDetail.tsx          # XSS-safe coin detailed performance panel
│   │   └── Portfolio.tsx           # Optimized transaction ledger tracking tool
│   ├── App.tsx                     # Global context bootsrapper
│   └── main.tsx                    # Render entry point
├── .env.example                    # Template environment variables configuration
├── eslint.config.js
├── package.json
├── vercel.json                     # Vercel routing configuration & API rewrites
├── vite.config.ts                  # Vite build tool and local dev server proxy configurations
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18+) and **npm** installed on your local computer.

### 1. Clone & Install Dependencies
Clone the repository and install the required modules:
```bash
git clone <your-repository-url>
cd crypto-price-tracker-dashboard

npm install
```

### 2. Configure Environment Variables
Copy the environment template and configure your parameters:
```bash
cp .env.example .env
```

Open `.env` and assign your variables. For local development, choose **one** of the following setups:

#### Option A: Running with Vercel CLI (Recommended)
Add your private key directly to your `.env` (without `VITE_` prefix):
```env
# .env
COINGECKO_API_KEY=your_secret_key_here
```
Run with:
```bash
# Install CLI
npm i -g vercel

# Run development server
vercel dev
```
Open [http://localhost:3000](http://localhost:3000) to inspect.

#### Option B: Running with Vite Dev Proxy
Add your key using the Vite prefix:
```env
# .env
VITE_API_KEY=your_secret_key_here
```
Run with:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) to inspect.

---

## 💻 Available Scripts

These scripts are mapped inside `package.json` to manage development, compilation, and linting [3]:

*   `npm run dev`: Boots the local Vite development server [3].
*   `npm run build`: Compiles TypeScript files and builds the optimized client bundle for production deployment [3].
*   `npm run lint`: Checks project files for standard style and syntax violations via ESLint [3].
*   `npm run preview`: Boots a local static server to preview the built production folder locally [3].

---

## 🔒 Security & API Integration

### Serverless Proxy Isolation
The application implements backend-forwarded headers:
*   **Client side:** The browser only fetches relative paths from your local server (e.g., `/api/coins/markets`) [1.2.7]. It never exposes the raw CoinGecko host or your key.
*   **Server side:** Vercel processes the request on a private Node.js runtime, appends the secret environment variable `COINGECKO_API_KEY`, and returns the sanitized payload safely [1.2.4, 1.2.6].

### Legal Compliance Attribution
This dashboard fully complies with the CoinGecko Style Guide, displaying proper legal attribution globally within the Sidebar footer and the Dashboard viewport [2].