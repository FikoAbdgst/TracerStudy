# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui `radix-nova`.

## Stack

| Layer | Tech | Detail |
|-------|------|--------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic — all routes in `routes/web.php` (no `routes/api.php`) |
| Frontend | React 18, Inertia.js 2, Tailwind 3, PostCSS | `.jsx` only, no TS; entrypoint `resources/js/app.jsx` |
| UI | shadcn/ui `radix-nova` | `Components/ui/` (capital C); `@radix-ui/react-slot`; lucide-react; CSS vars in `app.css`; `@tailwindcss/forms` in devDeps but **not** in tailwind config plugins |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | `.env` uses pgsql; `.env.example` defaults to SQLite; phpunit.xml overrides to `:memory:` |
| Auth | Breeze + Sanctum | `verified` middleware used but `MustVerifyEmail` NOT on User model; session/cache/queue all `database` driver |
| Roles | Spatie Permission v7 | `Admin Kampus`, `Admin PT`, `Alumni` |

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | serve + queue:listen + pail + Vite concurrently via `npx concurrently` |
| `composer test` | `config:clear` then `artisan test` (Unit + Feature) |
| `composer setup` | full bootstrap — `composer install`, `.env`, key, **`migrate --force`** (not fresh), `npm install --ignore-scripts`, `npm run build` |
| `php artisan migrate:fresh --seed` | Reset DB with demo accounts (all `password123`) |
| `php artisan test --filter=<name>` | Single test |
| `./vendor/bin/pint` | PHP code style fix |
| `php artisan storage:link` | Required — serves CVs, photos, MoU docs |

## Role routing

| Role | URL prefix | Controllers dir | Pages dir |
|------|-----------|----------------|-----------|
| `Admin Kampus` | `/admin-kampus` | `AdminKampus/` | `AdminKampus/` |
| `Admin PT` | `/perusahaan` | `Perusahaan/` | `Perusahaan/` |
| `Alumni` | `/alumni` | `Alumni/` | `Alumni/` |

Forum at `/alumni/forum` for `Alumni|Admin Kampus`. Guest routes: `/` (landing), `/perusahaan/{company}`, `/alumni-explorer`, `/perusahaan-explorer`, `/lowongan-explorer`.

Login redirect in `AuthenticatedSessionController` — not middleware. Admin PT users with `verification_status === 'rejected'` are locked out on login.

## Shared Inertia props

`auth.user` — `id, name, email, roles: string[], notifications, unread_count` or `null`. Roles from `$user->getRoleNames()`. `notifications` is capped at 5 unread items (not all). Flash keys: `message`, `error`, `duplicates`, `import_result`, `import_error`, `draft_body`, `draft_cv_path`, `draft_cv_name` (whitelisted in `HandleInertiaRequests` — new flash keys must be added there or they never reach the frontend).

## Conventions

- **Path aliases** — `@/` → `resources/js/` via `jsconfig.json`; `ziggy-js` → `./vendor/tightenco/ziggy`
- **Forms** — `@inertiajs/react`'s `useForm` (not react-hook-form)
- **`cn()`** — `@/lib/utils` exports `clsx` + `tailwind-merge`
- **Components** — `components.json` aliases point to `@/components/ui` (lowercase `components/`), actual files at `Components/ui/` (capital C); imports use `@/Components/ui/...`
- **Notifications** — `SystemNotification($title, $body, $url, $type)` via database channel only; polled via `auth.user.notifications`
- **Messaging** — `ChatController` — poll-based (no broadcasting); `Admin PT` gets empty results from `searchAlumni()` (returns `[]`, not 403) and is blocked from `startAlumni()` (aborts 403); all other authenticated roles have full access
- **SPK matching** — `App\Helpers\TextSimilarity::calculate()` (TF-IDF Cosine Similarity); `JobPosting` has `weight_*` columns
- **Master data** — `MasterCategory` (tabs: Keahlian, Sektor Industri, Program Studi) → `MasterItem` (values)
- **Maps** — `react-leaflet` + `leaflet`
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; `npm install --ignore-scripts` is still used in setup (redundant but harmless)
- **Private files** — `PrivateFileController` at `GET /storage/private/{path}` (auth, route `where('path', '.*')`); role-based ACL inside controller (Admin Kampus: all; Admin PT: own MoUs + own applicants' CVs; Alumni: own CV at `alumni_cvs/` + CVs from their job applications at `cv_documents/`)
- **Policies** — `ForumTopicPolicy`, `ForumReplyPolicy`, `MessagePolicy` bound via `Gate::policy()` in `AppServiceProvider`
- **Seeder** — uses `new User()` explicitly (no factories; `UserFactory` exists for tests only); clears Spatie cache at start
- **Tests** — Breeze-generated (Auth + Profile) plus `AlumniImportTest` (roundtrip template→import, partial-header rejection)
- **CV feature** — flash keys exist but `CurriculumVitae` model not yet created

## Gotchas

- `.env` contains **real credentials** (PostgreSQL password, Brevo SMTP key) — never commit secrets
- `MustVerifyEmail` is commented in `User.php` — `verified` middleware used on forum + messaging routes, but email verification is **not enforced**
- `Model::preventLazyLoading()` enabled in non-production — N+1 queries throw exceptions in dev
- `ForumTopic.slug` not-null — `booted()` auto-fills from title; `attachment` JSON yields computed `attachment_urls` accessor
- Forum topic/reply create routes throttled: `throttle:3,10` and `throttle:5,10`
- `POST /api/master-data/keahlian/quick-add` is in `web.php` with **no auth middleware** — publicly accessible
- **CSS vars mismatch** — `app.css` has a shadowed `:root` (hsl format) inside `@layer base` (oklch format); `tailwind.config.js` uses `hsl(var(...))` which picks up the outer `:root` values. Changing one without the other breaks colors.
- **z-index ladder** — sidebar/`.al-sidebar` is `z-index: 60` (desktop) / `65` (mobile, must stay above the `55` drawer backdrop). Any portal overlay above the sidebar must be `z-index > 65`: shadcn `Dialog` (`Components/ui/dialog.jsx`) was bumped from `z-50` to `z-[70]` — don't revert, and apply the same rule to new components. Page-level modals use `9000+`.
- `IndustrySektor` and `ProgramStudi` models exist but are **unused** — master data via `MasterCategory`/`MasterItem`
- Test logins (all `password123`): `superadmin@sitami.ac.id` (Admin Kampus), `adminkampus@sitami.ac.id`, `fiko@alumni.sitami.ac.id`, `hrd@inovasidinamika.com`; full list in `database/seeders/DatabaseSeeder.php`
