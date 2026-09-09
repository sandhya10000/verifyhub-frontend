# VerifyHub Frontend — Project Structure

> **Stack**: React 19 · Vite 8 · MUI v9 · React Router v7 · Axios · React Hook Form · Zod · Recharts · Lucide React

---

## 1. Folder Tree

```
verifyhub-frontend/
├── index.html                  # HTML shell; sets favicon, Google Fonts, <div id="root">
├── vite.config.js              # Vite build config (React plugin)
├── eslint.config.js            # ESLint config (oxlint)
├── .oxlintrc.json              # oxlint rule overrides
├── .env                        # Environment variables (VITE_REACT_APP_API_URL, etc.)
├── package.json
├── public/                     # Static assets served at root URL by Vite
│   ├── wordmark.png            # Wordmark logo — used as browser tab favicon
│   ├── favicon.svg             # Original SVG favicon (superseded by wordmark.png)
│   ├── icons.svg               # SVG sprite (unused at runtime — legacy)
│   ├── logo.jpg                # Old favicon image (superseded)
│   ├── logo.jpeg               # Alternate logo asset (legacy)
│   └── verifyhub-logo.jpeg     # Full-color logo (legacy)
└── src/
    ├── main.jsx                # React entry point — mounts <App /> into #root
    ├── App.jsx                 # Root component — wires ThemeProvider, BrowserRouter, AuthProvider, AppRoutes
    ├── App.css                 # Global CSS resets and utilities
    ├── index.css               # Minimal baseline reset
    ├── assets/                 # Bundled image assets (imported by JS modules)
    ├── Components/             # Reusable UI components (NOT pages)
    │   ├── auth/               # Auth-flow UI blocks
    │   ├── common/             # Generic utility components
    │   ├── contact/            # Contact page sub-components
    │   ├── dashboard/          # (stub) Dashboard widget shell
    │   ├── home/               # Marketing homepage section components
    │   ├── layout/             # Public-site layout wrappers (Navbar, Footer, etc.)
    │   └── shared/             # Cross-cutting reusable atoms (Logo, StatCard, etc.)
    ├── context/                # React Context — global state
    ├── data/                   # Static data constants (nav links, contact info)
    ├── layouts/                # Full-page shell layouts for app sections
    ├── pages/                  # Route-level page components
    │   ├── admin/              # Admin panel pages
    │   ├── auth/               # Authentication pages
    │   └── partner/            # Partner portal pages
    ├── providers/              # Context provider wrappers
    ├── routes/                 # Centralized route definitions
    ├── schemas/                # Zod validation schemas
    ├── services/               # API layer (Axios instances + service functions)
    └── theme/                  # MUI theme configuration
```

---

## 2. Purpose of Each Major Directory

| Directory | Purpose |
|---|---|
| `src/assets/` | Bundled static images imported directly by JSX modules (logo, wordmark, hero image, etc.). Processed by Vite at build time — use for images that need hashing. |
| `public/` | Raw static files served as-is at the root URL. Use for the favicon, SVG sprites, or any file referenced from `index.html` by literal path. |
| `src/Components/` | All reusable UI building blocks. Organised by feature domain (`auth/`, `home/`, `layout/`). Should not contain any routing logic or page-level concerns. |
| `src/context/` | React Context definitions and their hook. Currently only `AuthContext` (auth state) lives here. |
| `src/data/` | Pure JS constants files — exported arrays/objects that drive navigation menus, footer links, and contact info. No side-effects, no API calls. |
| `src/layouts/` | Full-screen shell components that include the sidebar, topbar, and `<Outlet />`. Every authenticated route section has one layout here. |
| `src/pages/` | One file per route. Pages are thin — they compose Components and call services. Grouped by section (`admin/`, `auth/`, `partner/`). |
| `src/providers/` | Thin wrapper components that instantiate Context providers. `AuthProvider` wraps `AuthContext.Provider` with persistence logic. |
| `src/routes/` | Single file (`AppRoutes.jsx`) containing the entire route tree using React Router v7's `<Routes>`. All lazy imports live here. |
| `src/schemas/` | Zod schemas for form validation, consumed by React Hook Form via `@hookform/resolvers/zod`. |
| `src/services/` | Axios instance configuration + exported service objects (`authService`, `creditAPI`). This is the only place that makes HTTP calls. |
| `src/theme/` | MUI `createTheme()` config — palette, typography, shape, and component overrides. Consumed by `ThemeProvider` in `App.jsx`. |

---

## 3. Routes Overview

All routes are defined in `src/routes/AppRoutes.jsx`. Every page is **lazy-loaded** via `React.lazy()` + `<Suspense>`.

### Public Routes — layout: `PageLayout` (Navbar + Footer)

| Path | Component | File |
|---|---|---|
| `/` | `Home` | `src/pages/Home.jsx` |
| `/about` | `AboutSection` | `src/Components/home/AboutSection.jsx` |
| `/services` | `Services` | `src/pages/Services.jsx` |
| `/contact` | `Contact` | `src/pages/Contact.jsx` |
| `/products` | `ProductSection` | `src/Components/home/ProductSection.jsx` |
| `/privacy-policy` | `PrivacyPolicy` | `src/pages/PrivacyPolicy.jsx` |
| `/terms-of-service` | `TermsOfService` | `src/pages/TermsOfService.jsx` |
| `/grievance-officer` | `GrievanceOfficer` | `src/pages/GrievanceOfficer.jsx` |
| `/data-protection` | `DataProtection` | `src/pages/DataProtection.jsx` |

### Auth Routes — no shared layout (standalone pages)

| Path | Component | File |
|---|---|---|
| `/login` | `Login` | `src/pages/auth/Login.jsx` |
| `/signup` | `Signup` | `src/pages/auth/Signup.jsx` |
| `/forgot-password` | `ForgotPassword` | `src/pages/auth/ForgotPassword.jsx` |

### Partner Routes — layout: `PartnerLayout` · guard: `ProtectedRoute`

| Path | Component | File | Status |
|---|---|---|---|
| `/partner` | → redirect to `/partner/dashboard` | — | — |
| `/partner/dashboard` | `PartnerDashboard` | `src/pages/partner/Dashboard.jsx` | ✅ Built |
| `/partner/add-funds` | `AddFunds` | `src/pages/partner/AddFunds.jsx` | ✅ Built |
| `/partner/credit-reports` | `PlaceholderPage` | — | 🚧 Stub |
| `/partner/credit-reports/cibil` | `CibilReport` | `src/pages/partner/CibilReport.jsx` | ✅ Built |
| `/partner/credit-reports/experian` | `ExperianReport` | `src/pages/partner/ExperianReport.jsx` | ✅ Built |
| `/partner/credit-reports/equifax` | `EquifaxReport` | `src/pages/partner/EquifaxReport.jsx` | ✅ Built |
| `/partner/credit-reports/crif` | `CrifReport` | `src/pages/partner/CrifReport.jsx` | ✅ Built |
| `/partner/ai-analyzer` | `AiAnalyzer` | `src/pages/partner/AiAnalyzer.jsx` | ✅ Built |
| `/partner/account/activity` | `Activity` | `src/pages/partner/Activity.jsx` | ✅ Built |
| `/partner/account/transactions` | `TransactionHistory` | `src/pages/partner/TransactionHistory.jsx` | ✅ Built |
| `/partner/account/reports` | `Reports` | `src/pages/partner/Reports.jsx` | ✅ Built |
| `/partner/account/profile` | `Profile` | `src/pages/partner/Profile.jsx` | ✅ Built |
| `/partner/account/support` | `Support` | `src/pages/partner/Support.jsx` | ✅ Built |
| `/partner/pricing` | `PlaceholderPage` | — | 🚧 Stub |

### Admin Routes — layout: `AdminLayout` · no auth guard yet

| Path | Component | File | Status |
|---|---|---|---|
| `/admin` | → redirect to `/admin/overview` | — | — |
| `/admin/overview` | `AdminOverview` | `src/pages/admin/Overview.jsx` | ✅ Built |
| `/admin/partners` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/pricing` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/api` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/wallets` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/transactions` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/reports` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/support` | `PlaceholderPage` | — | 🚧 Stub |
| `/admin/settings` | `PlaceholderPage` | — | 🚧 Stub |

> **Note**: The `404` fallback is a plain `<div>404 Not Found</div>` — not yet a proper error page.

---

## 4. Layouts

### `PartnerLayout` (`src/layouts/PartnerLayout.jsx`)

The main authenticated shell for the Partner Portal.

- **Sidebar** (collapsible, 280 px expanded / 88 px collapsed):
  - Toggle button (ChevronLeft/Right) at the top right of the sidebar
  - Logo: full `<Logo>` when expanded, `wordmark.png` when collapsed
  - Collapsible "Credit Reports" sub-menu (`creditReportsOpen` state)
  - `useEffect` auto-closes the Credit Reports submenu when navigating away from `/partner/credit-reports/*`
  - Social media icon links at the bottom
- **Topbar**: sticky `<AppBar>` with page title, wallet balance chip, user avatar + dropdown menu (Profile / Log out)
- **Auth guard**: wrapped in `<ProtectedRoute>` in `AppRoutes.jsx`
- **User data**: consumed from `useAuth()` — `user.companyName`, `user.walletBalance`, `user.tier`, etc.
- **Mobile**: uses a `temporary` MUI Drawer triggered by a hamburger button

### `AdminLayout` (`src/layouts/AdminLayout.jsx`)

Shell for the Admin Console.

- **Sidebar**: permanent MUI Drawer, 260 px fixed width (not collapsible)
- **Topbar**: sticky AppBar with today's profit figure and "Export to Sheets" button
- No auth guard currently applied at the route level

---

## 5. Key Shared Components

### `src/Components/shared/`

| Component | Description | Used In |
|---|---|---|
| `Logo.jsx` | Renders `LOGO_1.png` as an `<img>`. Accepts `height`, `style`, `className`, `alt` props. Width scales via `auto`. | `PartnerLayout`, `AdminLayout`, auth pages |
| `StatCard.jsx` | MUI Card that displays a metric (label + value + optional trend indicator). | `pages/admin/Overview.jsx` |
| `DataTable.jsx` | Generic data table built on MUI. Accepts `columns` + `rows` props. | `pages/admin/Overview.jsx` |
| `StatusBadge.jsx` | Coloured pill/chip for status values (e.g. "active", "pending"). | `pages/admin/Overview.jsx` |
| `ScrollToTop.jsx` | Effect-only component: scrolls `window` to top on every route change. Rendered once inside `<AppRoutes>`. | `AppRoutes.jsx` |

### `src/Components/auth/`

| Component | Description | Used In |
|---|---|---|
| `AuthLayout.jsx` | Two-column auth page shell (left = `BrandPanel`, right = form slot). | Auth pages |
| `BrandPanel.jsx` | Left-side decorative branding panel shown on login/signup screens. | `AuthLayout` |
| `AuthCard.jsx` | White MUI Paper card that wraps the auth form content. | Auth pages |
| `PasswordField.jsx` | MUI `TextField` with show/hide toggle for password inputs. | Login, Signup, ForgotPassword |

### `src/Components/layout/`

| Component | Description | Used In |
|---|---|---|
| `Navbar.jsx` | Public site top navigation bar with logo, nav links, and login/signup CTAs. | `PageLayout` |
| `Footer.jsx` | Public site footer with link columns, social links, legal text. Data-driven by `src/data/navigation.js`. | `PageLayout` |
| `PageLayout.jsx` | Thin wrapper that composes `<Navbar>` + `{children}` + `<Footer>`. Used for all public pages. | `AppRoutes` (public route group) |
| `LegalPageLayout.jsx` | Styled container for long-form legal content pages (Privacy, Terms, etc.). | Legal pages |
| `Sidebar.jsx` | Empty stub — sidebar logic lives in `PartnerLayout` directly. | Unused |

### `src/Components/common/`

| Component | Description | Used In |
|---|---|---|
| `ProtectedRoute.jsx` | Route guard: checks `user` from `useAuth()`; redirects unauthenticated users to `/login`. | `AppRoutes` (partner route group) |
| `FeatureCard.jsx` | Marketing card with icon, title, description — used on the homepage. | `Home.jsx` |
| `FormField.jsx` | Thin MUI `TextField` wrapper integrated with React Hook Form's `register`. | Auth forms |
| `PrimaryButton.jsx` | Styled primary CTA button (uses MUI `Button` with theme `containedPrimary`). | Various pages |
| `SectionHeading.jsx` | Overline label + heading + optional subtitle block for marketing sections. | `Home.jsx`, section components |
| `IconBadge.jsx` | Circular coloured icon container used inside feature/stat cards. | Various |
| `Button.jsx`, `Card.jsx`, `Loader.jsx` | Empty stubs — not yet implemented. | Unused |

### `src/Components/home/`

| Component | Description |
|---|---|
| `HeroSection.jsx` | Above-the-fold hero with headline, sub-copy, and CTA buttons. |
| `ProductSection.jsx` | Product cards grid section on the homepage. Also rendered standalone at `/products`. |
| `FeaturesSection.jsx` | Feature highlights section (stub/partial). |
| `AboutSection.jsx` | About us section — also rendered standalone at `/about`. |
| `ServicesSection.jsx` | Services section (stub). |
| `FAQSection.jsx` | FAQ accordion section (stub). |
| `ContactSection.jsx` | Inline contact section on the homepage. |

---

## 6. State Management & Data Flow

### Auth State — React Context API

```
src/context/AuthContext.jsx    ← defines AuthContext + AuthProvider
src/providers/AuthProvider.jsx ← thin re-export wrapper
src/context/useAuth.js         ← custom hook: useContext(AuthContext)
```

**How it works:**
1. On app load, `AuthProvider` rehydrates `user` and `token` from `localStorage`.
2. `login(userData, token)` — called by auth pages after a successful API response. Writes to state + `localStorage`.
3. `logout()` — clears `localStorage` and nulls state. Navigation after logout is handled by the **calling component** (not the context), to avoid race conditions with `ProtectedRoute`.
4. `isLoading` flag prevents flash-of-unauthenticated-content during rehydration.

**Context value exposed:**
```js
{ user, token, isLoading, login, logout }
```

### Form State — React Hook Form + Zod

All forms use `useForm()` from `react-hook-form` paired with `zodResolver()` from `@hookform/resolvers/zod`. Schemas are centralised in `src/schemas/authSchemas.js`.

Pattern:
```js
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(loginSchema),
});
```

### Local Component State

All other state (sidebar collapse, dropdown open/closed, stepper step, modal visibility, API loading/error flags) is managed with `useState` / `useEffect` local to each page or layout component.

### No global state library (Redux / Zustand / MobX)

Currently there is **no Zustand, Redux, or MobX** in the project. If cross-page state beyond auth becomes needed, this is the natural next addition.

---

## 7. API Layer (`src/services/`)

### Axios instance config

- `baseURL`: `VITE_REACT_APP_API_URL` env var, defaults to `http://localhost:5000/api`
- `withCredentials: true` (sends cookies)
- **Request interceptor**: auto-injects `Authorization: Bearer <token>` from `localStorage`
- **Response interceptor**: on `401` → clears token + hard-redirects to `/login`

### Exported service functions

```js
// Auth
authService.login(data)            // POST /auth/login
authService.signup(data)           // POST /auth/register
authService.forgotPassword(email)  // POST /auth/request-password-reset
authService.logout()               // POST /auth/logout

// Credit Bureau APIs
creditAPI.generateCibilReport(payload)    // POST /credit/generate-cibil-report
creditAPI.getCibilReport(id)              // GET  /credit/get-cibil-rpt/:id
creditAPI.generateCrifReport(formData)    // POST /credit/generate-crif-report
creditAPI.submitCrifAnswer(payload)       // POST /credit/generate-crif-report
creditAPI.generateEquifaxReport(payload)  // POST /credit/generate-equifax-report
creditAPI.generateExperianReport(payload) // POST /credit/generate-experian-report
creditAPI.getAllCreditReports(bureau?)    // GET  /credit/get-credit-rpt[?bureau=...]
```

`mockData.js`: static JS objects used by `admin/Overview.jsx` for chart and table data while the admin API is not yet built.

---

## 8. Naming Conventions & Patterns

### File & Component Naming

- **Components**: `PascalCase.jsx` — e.g. `StatCard.jsx`, `PartnerLayout.jsx`
- **Services / hooks / schemas**: `camelCase.js` — e.g. `authService.js`, `useAuth.js`, `authSchemas.js`
- **CSS modules**: co-located with the page they style — e.g. `Home.css` next to `Home.jsx`
- **Assets**: `snake_case` or `kebab-case` — e.g. `LOGO_1.png`, `footer-logo.png`, `wordmark.png`

### Sidebar Nav Item Configuration Pattern

Nav items in `PartnerLayout` are defined as a plain JS array **above the JSX**, making them easy to extend:

```js
const navItems = [
  { text: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/partner/dashboard' },
  {
    text: 'Credit Reports',
    icon: <FileText size={20} />,
    children: [
      { text: 'CIBIL Credit Report', icon: <ShieldCheck size={16} />, path: '/partner/credit-reports/cibil' },
      // ...
    ],
  },
];
```

- Items **with** `path` navigate directly.
- Items **with** `children` toggle a `<Collapse>` submenu.
- Active state derived from `location.pathname.startsWith(item.path)`.
- Collapsed sidebar: hides `<ListItemText>`, centres icon, shows `title` tooltip.
- Credit Reports submenu auto-closes via `useEffect` when leaving `/partner/credit-reports/*`.

### Icon Import Pattern

| Icon set | Package | Usage |
|---|---|---|
| Sidebar / app UI | `lucide-react` | `<LayoutDashboard size={20} />` — named imports with explicit `size` prop |
| Social media | `react-icons/fa` | `<FaLinkedin size={15} />` |
| MUI-specific | `@mui/icons-material` | `<ExpandMore sx={{ fontSize: 18 }} />` |

### Form Pattern (Auth Pages)

```
1. Schema defined in src/schemas/authSchemas.js (Zod)
2. useForm() with zodResolver() in the page component
3. <FormField> or MUI <TextField> with {...register('fieldName')}
4. errors.fieldName?.message for inline validation messages
5. handleSubmit() calls authService.login() or authService.signup()
```

### Credit Report Page Pattern

All four report pages (`CibilReport`, `ExperianReport`, `EquifaxReport`, `CrifReport`) share the same structure:
1. Multi-step form stepper: Customer Details → Verification → Report
2. Local `useState` for: current step, form data, loading flag, error state, fetched report object
3. Submit calls the corresponding `creditAPI.generate*Report()` function
4. Report display section rendered conditionally once data is returned

### Route Addition Pattern

```jsx
// 1. Lazy-import at top of AppRoutes.jsx
const MyPage = lazy(() => import('../pages/section/MyPage'));

// 2. Add <Route> inside the appropriate parent group
<Route path="my-page" element={<MyPage />} />
```

---

## 9. Assets Inventory

### `src/assets/` — Vite-bundled (imported via JS)

| File | Size | Current Use |
|---|---|---|
| `LOGO_1.png` | 77 KB | Primary logo — rendered by `<Logo>` component in sidebars and auth pages |
| `wordmark.png` | 534 KB | Square wordmark — shown in collapsed sidebar state |
| `footer-logo.png` | 1.1 MB | Logo variant used in the public site `<Footer>` |
| `hero.png` | 13 KB | Hero section illustration on the homepage |
| `logo.png` | 1.0 MB | ⚠️ Appears unused in active code (legacy) |
| `verifyhub_shield_high_quality.png` | 1.7 MB | ⚠️ High-res shield graphic — appears unused in active code |
| `react.svg` | 4 KB | ⚠️ Vite scaffold default — unused, safe to delete |
| `vite.svg` | 9 KB | ⚠️ Vite scaffold default — unused, safe to delete |

### `public/` — Served at root URL (not bundled)

| File | Current Use |
|---|---|
| `wordmark.png` | Browser tab favicon (`<link rel="icon" href="/wordmark.png">` in `index.html`) |
| `favicon.svg` | ⚠️ Original SVG favicon — superseded by `wordmark.png` |
| `logo.jpg` | ⚠️ Old JPEG favicon — superseded |
| `logo.jpeg` | ⚠️ Legacy — not referenced in active code |
| `verifyhub-logo.jpeg` | ⚠️ Legacy — not referenced in active code |
| `icons.svg` | ⚠️ SVG sprite — not referenced in active code |

> **Cleanup opportunity**: Files marked ⚠️ are unused and can be removed to reduce repo and deploy weight. The two large PNGs in `src/assets/` (`logo.png`, `verifyhub_shield_high_quality.png`) should be audited before deletion — they won't be bundled if nothing imports them, but they still add repo size.

---

## 10. Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `react` | 19 | UI library |
| `react-dom` | 19 | DOM renderer |
| `vite` | 8 | Build tool & dev server |
| `react-router-dom` | 7 | Client-side routing |
| `@mui/material` | 9 | Component library (all UI primitives) |
| `@mui/icons-material` | 9 | MUI icon set (ExpandMore/Less) |
| `@emotion/react` + `@emotion/styled` | 11 | MUI CSS-in-JS engine |
| `lucide-react` | 1.25 | Sidebar & general app icons |
| `react-icons` | 5 | Social media icons (fa set) |
| `axios` | 1 | HTTP client |
| `react-hook-form` | 7 | Form state management |
| `@hookform/resolvers` | 5 | Bridge: react-hook-form ↔ Zod |
| `zod` | 4 | Schema-based form validation |
| `recharts` | 3 | Charts (Admin Overview bar chart) |
| `@emailjs/browser` | 4 | Contact form email sending (client-side) |
| `zxcvbn` | 4 | Password strength estimation |
| `@fontsource/inter` | 5 | Self-hosted Inter font |
| `@fontsource/plus-jakarta-sans` | 5 | Self-hosted Plus Jakarta Sans font |
| `oxlint` | 1 | Fast Rust-based linter (replaces ESLint) |
