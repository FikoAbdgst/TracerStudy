# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui (Radix-Nova).

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic (no API) |
| Frontend | React 18, Inertia.js 2 | Pages resolved from `./Pages/{name}.jsx` (`app.jsx:11-14`) |
| CSS | Tailwind 3, shadcn/ui | oklch color vars in `resources/css/app.css`; no Tailwind config colors |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | phpunit.xml overrides env |
| Auth | Laravel Breeze + Sanctum | Email verification enabled (`verified` middleware) |
| Roles | Spatie Permission v7 | `Super Admin`, `Admin Kampus`, `Admin PT`, `Alumni` |
| JS | `.jsx` (no TypeScript) | `tsx: false` in components.json |

## Key directories

| Path | Purpose |
|------|---------|
| `app/Http/Controllers/{SuperAdmin,AdminKampus,Alumni,Perusahaan}/` | Role-grouped controllers (note: `Perusahaan` = Admin PT) |
| `resources/js/Pages/{SuperAdmin,AdminKampus,Alumni,Perusahaan,Auth,Profile}/` | Role-grouped Inertia pages |
| `resources/js/Components/ui/` | shadcn components (14 files) |
| `routes/web.php` | All role-routed pages via `prefix` + `role:` middleware |
| `routes/auth.php` | Login, register, password reset, email verification |

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | Start all dev servers: serve + queue:listen + pail (logs) + Vite (via concurrently) |
| `npm run dev` | Vite dev server only |
| `npm run build` | Production asset build |
| `composer test` | `config:clear` then `artisan test` |
| `composer setup` | Full bootstrap: install, `.env`, key, migrate, `npm install --ignore-scripts`, `npm build` |
| `php artisan migrate:fresh --seed` | Reset DB with demo data (roles, companies, jobs, alumni, forum) |
| `composer pint` | Laravel Pint — PHP code style fixer (dev dep, no explicit script) |

## Conventions

- **Path aliases** — `@/` → `resources/js/`, `ziggy-js` → `./vendor/tightenco/ziggy` (`jsconfig.json`)
- **Role routing** — URL prefixes `/super-admin`, `/admin-kampus`, `/perusahaan`, `/alumni` with `role:<name>` middleware
- **JSON casts** — `AlumniProfile.skills`, `JobPosting.requirements`, `TracerStudyForm.questions` are JSON arrays (cast on model)
- **SPK weights** — `JobPosting` has `weight_skill`, `weight_education`, `weight_experience`, `weight_age` for alumni-job matching
- **Notifications** — Unread (latest 5) shared globally via `HandleInertiaRequests.php` → `auth.user.notifications`
- **Flash messages** — `message`, `error`, `duplicates` via `flash` Inertia prop
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; no postinstall hooks run
- **CSS tokens** — shadcn uses oklch in `app.css`; do not add raw Tailwind config colors

## Gotchas

- `.env` uses **PostgreSQL** (`DB_CONNECTION=pgsql`), `.env.example` defaults to SQLite
- Session, cache, queue all use `database` driver (jobs table must exist)
- `AlumniProfile` and `Company` are `hasOne` relations on `User`
- `ForumTopic.slug` has a not-null constraint — always populate with `Str::slug`
- `AlumniProfile` has `cv_path` and `photo_path` — file uploads require `storage:link`
- Seeder creates explicit records (no factories used in `DatabaseSeeder`)
