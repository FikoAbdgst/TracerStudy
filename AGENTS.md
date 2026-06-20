# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui (`radix-nova`).

## Stack

| Layer | Tech | Notes |
|-------|------|-------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic (`routes/web.php` only, no `api.php`) |
| Frontend | React 18, Inertia.js 2 | Pages resolved from `./Pages/{name}.jsx` |
| CSS | Tailwind 3 + PostCSS | oklch vars in `app.css`; `tailwind.config.js` only has `hsl()`; `@tailwindcss/forms` in devDeps but **not** in plugins array |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | phpunit.xml overrides env |
| Auth | Breeze + Sanctum | Email verification on (`verified` middleware) |
| Roles | Spatie Permission v7 | `Super Admin`, `Admin Kampus`, `Admin PT`, `Alumni` |
| JS | `.jsx` only (no TS) | `tsx: false` in components.json |

## Role ↔ directory/prefix mapping

| Role | URL prefix | Controllers dir | Pages dir |
|------|-----------|----------------|-----------|
| `Super Admin` | `/super-admin` | `SuperAdmin/` | `SuperAdmin/` |
| `Admin Kampus` | `/admin-kampus` | `AdminKampus/` | `AdminKampus/` |
| `Admin PT` | `/perusahaan` | `Perusahaan/` | `Perusahaan/` |
| `Alumni` | `/alumni` | `Alumni/` | `Alumni/` |

The `Admin PT` role name has no "s" and is `PT` (Perseroan Terbatas), not `Perusahaan` — the directory/prefix uses the Indonesian word.

## Key directories

- `app/Http/Controllers/{SuperAdmin,AdminKampus,Alumni,Perusahaan}/` — role-grouped controllers
- `resources/js/Pages/{SuperAdmin,AdminKampus,Alumni,Perusahaan,Auth,Profile}/` — role-grouped Inertia pages
- `resources/js/Layouts/AuthenticatedLayout.jsx` — custom nav from `menuConfig`; reads `auth.user.roles[0]`; embedded `<style>` (not shadcn navbar)
- `resources/js/Layouts/GuestLayout.jsx` — auth pages
- `resources/js/Components/ui/` — shadcn components
- `routes/web.php` — all role-routed pages via `prefix` + `role:` middleware
- `routes/auth.php` — login, register, forgot/reset, verify, logout
- `bootstrap/app.php` — Spatie aliases (`role`, `permission`, `role_or_permission`) registered here

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | serve + queue:listen + pail + Vite (concurrently, color-coded) |
| `npm run dev` | Vite only |
| `npm run build` | Production assets |
| `composer test` | `config:clear` then `artisan test` (Unit + Feature) |
| `php artisan test --filter=<name>` | Single test class/method |
| `composer setup` | Full bootstrap |
| `php artisan migrate:fresh --seed` | Reset DB with demo data |
| `./vendor/bin/pint` | PHP code style fixer |
| `php artisan storage:link` | Required for `AlumniProfile.cv_path` / `photo_path` |

## Conventions

- **Path aliases** — `@/` → `resources/js/`, `ziggy-js` → `./vendor/tightenco/ziggy`
- **Role routing** — URL prefixes `/super-admin`, `/admin-kampus`, `/perusahaan`, `/alumni` with `role:<name>` middleware; forum shared under `/alumni/forum` for `Alumni|Super Admin|Admin Kampus`
- **Shared Inertia props** — `auth.user` = `{ id, name, email, roles: string[], notifications, unread_count }` or `null`; `auth.user.roles` is a plain array; flash keys: `message`, `error`, `duplicates`
- **Forms** — Uses `@inertiajs/react`'s `useForm` (not react-hook-form)
- **Maps** — `react-leaflet` + `leaflet`
- **JSON casts** — `AlumniProfile.skills`, `JobPosting.requirements`, `TracerStudyForm.questions`, `ForumTopic.attachment` are JSON arrays; `JobApplication.interview_details` is JSON; `JobPosting.is_active` is cast to boolean
- **SPK matching** — `App\Helpers\TextSimilarity::calculate()` (TF-IDF Cosine Similarity); `JobPosting` has `weight_skill/education/experience/age`
- **Notifications** — `SystemNotification($title, $body, $url, $type)` via `$user->notify(...)`
- **`cn()`** — `@/lib/utils` exports `cn()` as `clsx` + `tailwind-merge`
- **Master data** — `MasterCategory` (tabs: Keahlian, Sektor Industri, Program Studi) → `MasterItem` (values)
- **User `$fillable`** — PHP 8 `#[Fillable(['name', 'email', 'password'])]`; `role` column is NOT fillable (DB enum, redundant with Spatie roles)
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; `npm install --ignore-scripts` in `composer setup`
- **No CI** — no `.github/workflows/`
- **Private file serving** — `GET /storage/private/{path}` via `PrivateFileController` (custom, behind `auth`)
- **Quick Add Keahlian** — `POST /api/master-data/keahlian/quick-add` is a **public** route (no auth middleware), returns JSON

## Gotchas

- `.env` uses **PostgreSQL**; `.env.example` defaults to SQLite
- Session, cache, queue all default to `database` driver
- `User::create(['role' => ...])` mass-assignment fails (not in `$fillable`); seeder uses `new User()` + direct property set
- **Login rejection**: `Admin PT` users whose company `verification_status === 'rejected'` are locked out entirely (logout + validation error thrown in `AuthenticatedSessionController`)
- `AlumniProfile` and `Company` are `hasOne` on `User`
- `ForumTopic.slug` not-null — `booted()` auto-fills from title; `attachment` JSON yields computed `attachment_urls` accessor (`Storage::url`)
- Forum topic/reply routes have `throttle:3,10` and `throttle:5,10`
- `AlumniProfile` has `cv_path` + `photo_path` — requires `php artisan storage:link`
- Seeder uses explicit records, not factories; `UserFactory` exists for tests only
- Test logins (all `password123`): `superadmin@sitami.ac.id`, `adminkampus@sitami.ac.id`, `fiko@alumni.sitami.ac.id`, `hrd@inovasidinamika.com`
- `README.md` is stock Laravel boilerplate (not customized)
- Timezone: UTC
