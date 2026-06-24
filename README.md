Here is the updated, complete `README.md` containing your exact project versions, dependencies, and script commands.

***

# NEXUS_SYS: Cyberpunk Crypto Price Tracker Dashboard

A responsive, high-performance cryptocurrency price tracking terminal and local asset ledger built with **React 19**, **Vite 8**, **TypeScript 6**, and **Tailwind CSS v4** [3].

Powered directly by the **CoinGecko API** (Demo Plan), the interface features an offline-resilient architecture, dynamic search-to-market pipelines, custom interactive SVG visualization, and local storage state persistence [1].

---

## 🛠️ Tech Stack & Protocols

*   **Compiler & Bundler:** React 19.2.6 + Vite 8.0.12 + TypeScript 6.0.2 [3]
*   **Style Engine:** Tailwind CSS v4.3.1 (utilizing the native `@tailwindcss/vite` plugin) [3]
*   **Data Stream Source:** CoinGecko API v3 (Demo Tier) [1]
*   **Storage Mechanics:** Browser-native `localStorage` for watchlists and transaction ledgers
*   **Visualizations:** Inline responsive vector calculations (zero external plotting dependencies)

---

## ⚡ Core Features

### 1. Dynamic Ingestion & Live Fallback (Resilient Telemetry)
*   The system actively queries CoinGecko's REST endpoints using authenticated header tokens [1].
*   **Rate-Limit Protection:** If the API returns `HTTP 429` (limit reached) or connection states fail, a local data core automatically assumes control, preserving the layout and user experience without visual breaks [1].

### 2. Network Diagnostics (Header Status Indicator)
*   Displays real-time connectivity feedback (e.g., `API_OK 200`, `API_ERR 429`, `API_ERR 404`, or `API_MOCK`) based on responses received from network requests.

### 3. Dual-Layout Asset Explorer (Grid & List Viewports)
*   Offers layout options (Grid and List views) to explore top cryptocurrencies.
*   Assets are rendered with mini historical trend indicators mapped directly from raw sparkline coordinates [1].

### 4. Dynamic API Resolution & Global Search
*   Bypasses typical client-side limits by running search queries through the `/search?query={term}` endpoint first [1].
*   The top resolved coin IDs are passed directly into a subsequent `/coins/markets` request, allowing the application to fetch live prices and sparklines for any globally listed coin on the fly [1].

### 5. Custom Interactive Charting
*   Our timeline chart (`PriceChart.tsx`) compiles coordinate arrays into inline SVG vectors.
*   Supports live, responsive timeframes (1D, 7D, 30D) [1].
*   Tracks cursor movements across the timeline to render snapping vertical crosshairs and localized historical coordinates.

### 6. Interactive Ledger Portfolio (`CODENAME_LEDGER`)
*   An asset manager that tracks custom entry points.
*   Users can submit transaction logs (quantities, buy prices), record assets, and calculate cost bases and net gains based on live market valuations.

### 7. Persistent Watchlist Toggles
*   Allows toggling assets in and out of watchlists with persistent stars available across Grid, List, and Detail modules.
*   Watchlist arrays are stored locally within the browser, updating status logs in real-time.

### 8. Legal Compliance Attribution
*   Integrates brand attributions ("Data provided by CoinGecko") globally inside the Sidebar footer and the Dashboard, in accordance with the CoinGecko Style Guidelines [2].

---

## 📂 Directory Structure

```text
.
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
│   │   │   ├── PriceChart.tsx      # Inline interactive SVG line graph
│   │   │   └── Sparkline.tsx       # Mini zero-dependency list graph
│   │   └── layout/
│   │       ├── MainLayout.tsx      # Main layout coordinator
│   │       ├── Sidebar.tsx         # Sidebar navigation and status footer
│   │       └── Topbar.tsx          # Dynamic diagnostics header
│   ├── context/
│   │   └── AppProvider.tsx         # Unified global state machine & API status listener
│   ├── hooks/
│   │   └── useCoinGecko.ts         # React Hooks for details, markets, and charts
│   ├── services/
│   │   └── coingecko.ts            # Core API request class
│   ├── utils/
│   │   └── mockData.ts             # Offline telemetry fallback profiles
│   ├── views/
│   │   ├── Dashboard.tsx           # Main explore console and search view
│   │   ├── CoinDetail.tsx          # Comprehensive coin detail performance panel
│   │   └── Portfolio.tsx           # Transaction ledger ledger tracking tool
│   ├── App.tsx                     # Global context bootsrapper
│   └── main.tsx                    # Render entry point
├── .env.example                    # Template environment variables configuration
├── eslint.config.js
├── package.json
├── vite.config.ts                  # Vite build tool and Tailwind CSS plugin configuration
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have **Node.js** (v18+) and **npm** installed on your local computer.

### 1. Clone & Install Dependencies
Clone the repository and install the required modules:
```bash
# Clone the repository
git clone <your-repository-url>
cd crypto-price-tracker-dashboard

# Install packages
npm install
```

### 2. Configure Environment Variables
Vite requires client-exposed environment variables to begin with the `VITE_` prefix.

Copy the environment template and configure your parameters:
```bash
cp .env.example .env
```

Open `.env` and assign your variables:
```env
# CoinGecko API Telemetry Stream Options
VITE_BASE_URL=https://api.coingecko.com/api/v3
VITE_API_KEY=YOUR_COINGECKO_DEMO_KEY_HERE
```
> **Notice:** The Demo API Key begins with the `CG-` prefix [1]. Do not wrap the value in quotes or add spacing next to the `=` operator.

### 3. Reload and Start

Since environment variables are loaded only when the development server boots, start or restart the process to apply the configuration:

```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to inspect your local build.

---

## 💻 Available Scripts

These scripts are mapped directly inside `package.json` to manage development, compilation, and linting [3]:

*   `npm run dev`: Boots the local Vite development server [3].
*   `npm run build`: Compiles TypeScript files and builds the optimized client bundle for production deployment [3].
*   `npm run lint`: Checks project files for standard style and syntax violations via ESLint [3].
*   `npm run preview`: Boots a local static server to preview the built production folder locally before deployment [3].

---

## 🔒 Security & API Integration

### Base URLs & Headers
The application is pre-configured to align with CoinGecko's plan rules:

*   **Demo Tier:** Fetches from `https://api.coingecko.com/api/v3` using the `x-cg-demo-api-key` header [1].
*   **Pro Tier:** Fetches from `https://pro-api.coingecko.com/api/v3` using the `x-cg-pro-api-key` header [1].

### Rate-Limits (HTTP 429)
The Demo Plan allows for **30 requests per minute** [1]. If this threshold is crossed, the layout remains secure and readable by temporarily serving stored local assets from `mockData.ts`. This state is signaled on-screen via the header status indicator.