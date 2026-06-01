# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui (Radix-Nova).

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic (no separate API) |
| Frontend | React 18, Inertia.js 2 | Pages resolved by component name from `resources/js/Pages/` |
| CSS | Tailwind 3, shadcn/ui | oklch color vars in `resources/css/app.css` |
| DB | PostgreSQL (dev), SQLite :memory: (test) | phpunit.xml overrides env |
| Auth | Laravel Breeze + Sanctum | Email verification enabled |
| Roles | Spatie Permission v7 | 4 roles: `Super Admin`, `Admin Kampus`, `Admin PT`, `Alumni` |
| JS | Plain `.jsx` (no TypeScript) | `tsx: false` in components.json |

## Directory layout

- **`app/Http/Controllers/{SuperAdmin,AdminKampus,Alumni,Perusahaan}`** — role-grouped controllers
- **`app/Models/`** — 14 models (User, AlumniProfile, Company, JobPosting, etc.)
- **`resources/js/Pages/{SuperAdmin,AdminKampus,Alumni,Perusahaan,Auth,Profile}`** — role-grouped Inertia pages
- **`resources/js/Components/ui/`** — shadcn components
- **`routes/web.php`** — all role-routed pages (`prefix` + `role:` middleware per group)
- **`routes/auth.php`** — login, register, password reset, email verification

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | Start all dev servers: `serve` + `queue:listen` + `pail` (logs) + Vite, via concurrently |
| `npm run dev` | Vite dev server only |
| `npm run build` | Production asset build |
| `composer test` | `config:clear` then `artisan test` |
| `composer setup` | Full bootstrap: install, `.env`, key, migrate, `npm install --ignore-scripts`, `npm build` |
| `php artisan migrate:fresh --seed` | Reset DB with full demo data (roles, companies, jobs, alumni, forum) |

## Conventions

- **No TypeScript** — use `.jsx` with JSDoc if needed.
- **Path aliases** — `@/` → `resources/js/`, `ziggy-js` → `./vendor/tightenco/ziggy` (via `jsconfig.json`).
- **Role routing** — URL prefixes `/super-admin`, `/admin-kampus`, `/perusahaan`, `/alumni` with `role:<name>` middleware.
- **PHP 8 attributes** — User model uses `#[Fillable]` / `#[Hidden]` alongside traditional `$fillable` / `$hidden`. Match whichever style is used in the file.
- **JSON casts** — `AlumniProfile.skills` and `JobPosting.requirements` are stored as JSON arrays (cast on model).
- **Notifications** — Unread (latest 5) shared globally via `HandleInertiaRequests.php` → `auth.user.notifications`.
- **Flash messages** — `message`, `error`, `duplicates` available via `flash` Inertia prop.
- **Ziggy** — `@routes` in Blade gives JS access to named Laravel routes.
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; no postinstall hooks run.
- **Indent** — 4 spaces (`.editorconfig`), 2 for yaml.
- **CSS tokens** — shadcn uses oklch color space in `app.css`. Do not add raw Tailwind config colors.

## Testing

- `composer test` runs `config:clear` then `artisan test` (not `phpunit` directly).
- SQLite `:memory:` via `phpunit.xml` env overrides (`QUEUE_CONNECTION=sync`, `SESSION_DRIVER=array`, etc.).
- `database/factories/UserFactory.php` exists; seeders use explicit records (no factories in `DatabaseSeeder`).

## Gotchas

- `.env` uses **PostgreSQL** (`DB_CONNECTION=pgsql`), while `.env.example` defaults to SQLite.
- Session, cache, and queue all use the `database` driver (jobs table must exist).
- `AlumniProfile` and `Company` are `hasOne` relations on `User`.
- `ForumTopic.slug` has a not-null constraint — always populate it (use `Str::slug`).
- `Breeze` is a dev dependency (scaffolding only, not a runtime requirement).
- `HasRoles` trait from Spatie must be used on User model (already applied).
