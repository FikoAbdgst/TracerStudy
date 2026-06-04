# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui (Radix-Nova).

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic (no `api.php`) |
| Frontend | React 18, Inertia.js 2 | Pages resolved from `./Pages/{name}.jsx` (`app.jsx:11-14`) |
| CSS | Tailwind 3, shadcn/ui | oklch color vars in `resources/css/app.css`; no raw colors in Tailwind config |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | phpunit.xml overrides env |
| Auth | Laravel Breeze + Sanctum | Email verification enabled (`verified` middleware) |
| Roles | Spatie Permission v7 | `Super Admin`, `Admin Kampus`, `Admin PT`, `Alumni` |
| JS | `.jsx` (no TypeScript) | `tsx: false` in components.json |

## Key directories

| Path | Purpose |
|------|---------|
| `app/Http/Controllers/{SuperAdmin,AdminKampus,Alumni,Perusahaan}/` | Role-grouped controllers (`Perusahaan` = Admin PT) |
| `resources/js/Pages/{SuperAdmin,AdminKampus,Alumni,Perusahaan,Auth,Profile}/` | Role-grouped Inertia pages |
| `resources/js/Components/ui/` | shadcn components |
| `resources/js/Layouts/` | `AuthenticatedLayout.jsx` (all role pages), `GuestLayout.jsx` (auth pages) |
| `routes/web.php` | All role-routed pages via `prefix` + `role:` middleware |
| `routes/auth.php` | Login, register, password reset, email verification |
| `bootstrap/app.php` | Spatie middleware aliases (`role`, `permission`) registered here |

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | Start all dev servers: serve + queue:listen + pail (logs) + Vite (via concurrently) |
| `npm run dev` | Vite dev server only |
| `npm run build` | Production asset build |
| `composer test` | `config:clear` then `artisan test` (runs Unit + Feature suites) |
| `php artisan test --filter=<name>` | Run a single test class or method |
| `composer setup` | Full bootstrap: install, `.env`, key, migrate, `npm install --ignore-scripts`, `npm run build` |
| `php artisan migrate:fresh --seed` | Reset DB with demo data (roles, companies, jobs, alumni, forum) |
| `composer pint` | Laravel Pint — PHP code style fixer |

## Conventions

- **Path aliases** — `@/` → `resources/js/`, `ziggy-js` → `./vendor/tightenco/ziggy` (`jsconfig.json`)
- **Role routing** — URL prefixes `/super-admin`, `/admin-kampus`, `/perusahaan`, `/alumni` with `role:<name>` middleware
- **Shared Inertia props** — `auth.user` is `{ id, name, email, roles: string[], notifications, unread_count }` or `null`; `auth.user.roles` is plain string array; flash keys: `message`, `error`, `duplicates`
- **Layout** — All role-protected pages wrap content with `AuthenticatedLayout` from `@/Layouts/AuthenticatedLayout`
- **Form handling** — `react-hook-form` + `zod` schema + `@hookform/resolvers/zod` (see existing pages for pattern)
- **Data tables** — `@tanstack/react-table` for sortable/filterable lists
- **Maps** — `react-leaflet` + `leaflet` for location features on companies, job postings, alumni profiles
- **JSON casts** — `AlumniProfile.skills`, `JobPosting.requirements`, `TracerStudyForm.questions` are JSON arrays (cast on model)
- **SPK weights** — `JobPosting` has `weight_skill`, `weight_education`, `weight_experience`, `weight_age` for alumni-job matching
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; no postinstall hooks run

## Gotchas

- `.env` uses **PostgreSQL** (`DB_CONNECTION=pgsql`), `.env.example` defaults to SQLite
- Session, cache, queue all use `database` driver (jobs table must exist)
- `AlumniProfile` and `Company` are `hasOne` relations on `User`
- `ForumTopic.slug` has a not-null constraint — always populate with `Str::slug`
- `AlumniProfile` has `cv_path` and `photo_path` — file uploads require `php artisan storage:link`
- Seeder creates explicit records (no factories used in `DatabaseSeeder`)
- Test login accounts: `superadmin@sitami.ac.id`, `adminkampus@sitami.ac.id`, `fiko@alumni.sitami.ac.id` — all with password `password123`
