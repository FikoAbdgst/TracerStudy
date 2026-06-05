# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui (style: `radix-nova`).

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic (no `api.php`) |
| Frontend | React 18, Inertia.js 2 | Pages resolved from `./Pages/{name}.jsx` (`app.jsx:11-14`) |
| CSS | Tailwind 3 + PostCSS | oklch color vars in `resources/css/app.css`; `tailwind.config.js` only has `hsl()` refs (no raw colors); `@tailwindcss/forms` in deps but **not** in tailwind plugins array |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | phpunit.xml overrides env |
| Auth | Breeze + Sanctum | Email verification on (`verified` middleware) |
| Roles | Spatie Permission v7 | `Super Admin`, `Admin Kampus`, `Admin PT`, `Alumni` |
| JS | `.jsx` only (no TS) | `tsx: false` in components.json |

## Key directories

- `app/Http/Controllers/{SuperAdmin,AdminKampus,Alumni,Perusahaan}/` — role-grouped controllers
- `resources/js/Pages/{SuperAdmin,AdminKampus,Alumni,Perusahaan,Auth,Profile}/` — role-grouped Inertia pages
- `resources/js/Layouts/AuthenticatedLayout.jsx` — role nav from `menuConfig` object (line 13); reads `auth.user.roles[0]` (line 49); **embedded `<style>` tag** for a custom design system (not shadcn navbar)
- `resources/js/Layouts/GuestLayout.jsx` — auth pages
- `resources/js/Components/ui/` — shadcn components
- `routes/web.php` — all role-routed pages via `prefix` + `role:` middleware
- `routes/auth.php` — login, register, forgot/reset password, email verify, logout
- `bootstrap/app.php` — Spatie aliases (`role`, `permission`, `role_or_permission`) registered here (line 25-29)

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | serve + queue:listen + pail + Vite via `npx concurrently` (color-coded names) |
| `npm run dev` | Vite only |
| `npm run build` | Production assets |
| `composer test` | `config:clear` then `artisan test` (Unit + Feature) |
| `php artisan test --filter=<name>` | Single test class/method |
| `composer setup` | Full bootstrap: `composer install`, `.env`, key, `migrate --force`, `npm install --ignore-scripts`, `npm run build` |
| `php artisan migrate:fresh --seed` | Reset DB with demo data |
| `./vendor/bin/pint` | PHP code style fixer |

## Conventions

- **Path aliases** — `@/` → `resources/js/`, `ziggy-js` → `./vendor/tightenco/ziggy` (`jsconfig.json`)
- **Role routing** — URL prefixes `/super-admin`, `/admin-kampus`, `/perusahaan`, `/alumni` with `role:<name>` middleware; forum shared under `/alumni/forum` for `Alumni|Super Admin|Admin Kampus`
- **Shared Inertia props** — `auth.user` = `{ id, name, email, roles: string[], notifications, unread_count }` or `null`; `auth.user.roles` is plain array; flash keys: `message`, `error`, `duplicates` (see `HandleInertiaRequests.php`)
- **Form handling** — `react-hook-form` + `zod` + `@hookform/resolvers/zod`
- **Data tables** — `@tanstack/react-table`
- **Maps** — `react-leaflet` + `leaflet`
- **JSON casts** — `AlumniProfile.skills`, `JobPosting.requirements`, `TracerStudyForm.questions`, `ForumTopic.attachment` are JSON arrays; `JobApplication.interview_details` is JSON
- **SPK matching** — `App\Helpers\TextSimilarity::calculate()` (TF-IDF Cosine Similarity); `JobPosting` has `weight_skill/education/experience/age`
- **Notifications** — Single `SystemNotification($title, $body, $url, $type)` via `$user->notify(...)`
- **`cn()`** — `@/lib/utils` exports `cn()` as `clsx` + `tailwind-merge`
- **Master data** — `MasterCategory` (tabs: Keahlian, Sektor Industri, Program Studi) → `MasterItem` (values)
- **User `$fillable`** — PHP 8 `#[Fillable(['name', 'email', 'password'])]` attribute (Laravel 13); `role` column is NOT fillable (DB enum, display only, redundant with Spatie roles)
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; `npm install --ignore-scripts` in setup script
- **No CI** — `.github/workflows/` absent

## Gotchas

- `.env` uses **PostgreSQL**; `.env.example` defaults to SQLite
- Session, cache, queue all use `database` driver (jobs table required)
- `User::create(['role' => ...])` will mass-assignment fail (not in `$fillable`); seeder uses `new User()` + direct property set instead
- `AlumniProfile` and `Company` are `hasOne` on `User`
- `ForumTopic.slug` not-null — `booted()` auto-fills from title on create; `attachment` JSON yields computed `attachment_urls` accessor (`Storage::url`)
- Forum topic/reply routes have `throttle:3,10` and `throttle:5,10`
- `AlumniProfile` has `cv_path` + `photo_path` — requires `php artisan storage:link`
- Seeder uses explicit records, not factories; `UserFactory` exists for tests only
- Test logins (all `password123`): `superadmin@sitami.ac.id`, `adminkampus@sitami.ac.id`, `fiko@alumni.sitami.ac.id`, `hrd@inovasidinamika.com`
- `README.md` is stock Laravel boilerplate (not customized)
- Timezone: UTC
