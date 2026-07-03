# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui `radix-nova`.

## Stack

| Layer | Tech | Detail |
|-------|------|--------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic — all routes in `routes/web.php` (no `routes/api.php`) |
| Frontend | React 18, Inertia.js 2, Tailwind 3, PostCSS | `.jsx` only, no TS; entrypoint `resources/js/app.jsx` |
| UI | shadcn/ui `radix-nova` | `Components/ui/`; `@radix-ui/react-slot`; lucide-react icons; oklch CSS vars in `app.css`; `@tailwindcss/forms` in devDeps but **not** in `tailwind.config.js` plugins |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | phpunit.xml overrides; `.env.example` defaults to SQLite |
| Auth | Breeze + Sanctum | `verified` middleware used but `MustVerifyEmail` NOT on User model; session/cache/queue all `database` driver |
| Roles | Spatie Permission v7 | `Super Admin`, `Admin Kampus`, `Admin PT`, `Alumni` |

## Role ↔ directory/prefix mapping

| Role | URL prefix | Controllers dir | Pages dir |
|------|-----------|----------------|-----------|
| `Super Admin` | `/super-admin` | `SuperAdmin/` | `SuperAdmin/` |
| `Admin Kampus` | `/admin-kampus` | `AdminKampus/` | `AdminKampus/` |
| `Admin PT` | `/perusahaan` | `Perusahaan/` | `Perusahaan/` |
| `Alumni` | `/alumni` | `Alumni/` | `Alumni/` |

Forum shared under `/alumni/forum` for `Alumni|Super Admin|Admin Kampus`.

## Commands

| Command | Purpose |
|---------|---------|
| `composer dev` | serve + queue:listen + pail + Vite concurrently |
| `composer test` | `config:clear` then `artisan test` (Unit + Feature) |
| `composer setup` | full bootstrap — `composer install`, copy `.env`, `key:generate`, `migrate --force`, `npm install --ignore-scripts`, `npm run build` |
| `php artisan migrate:fresh --seed` | Reset DB with demo data |
| `php artisan test --filter=<name>` | Single test class/method |
| `./vendor/bin/pint` | PHP code style fix (Laravel Pint) |
| `php artisan storage:link` | Required — serves CVs, photos, MoU docs |

## Shared Inertia props

`auth.user` — keys: `id, name, email, roles: string[], notifications, unread_count` or `null`. Only 5 latest unread notifications sent. `roles` is a plain array from `$user->getRoleNames()`.

Flash keys — `message`, `error`, `duplicates`, `draft_body`, `draft_cv_path`, `draft_cv_name`.

## Conventions

- **Path aliases** — `@/` → `resources/js/` (`jsconfig.json`); `ziggy-js` → `./vendor/tightenco/ziggy`
- **Forms** — `@inertiajs/react`s `useForm` (not react-hook-form)
- **`cn()`** — `@/lib/utils` exports `clsx` + `tailwind-merge`
- **Region data** — `resources/js/Data/kota.json` and `wilayah.json` for location pickers
- **Notifications** — `SystemNotification($title, $body, $url, $type)` via database channel only; polled on frontend via `auth.user.notifications`
- **Messaging** — poll-based (no broadcasting); routes prefixed with `/messages`; includes block/unblock, conversation clear, delete message, company-to-alumni invite
- **Messaging role gates** — `Admin PT` blocked from `searchAlumni()` and `startAlumni()`; only `Alumni`, `Admin Kampus`, and `Super Admin` can search & message alumni directly; `startAlumni()` restricted to alumni-to-alumni by default but widened to include admin roles
- **Maps** — `react-leaflet` + `leaflet`
- **Vite chunks** — `build.rollupOptions.output.manualChunks` splits vendor-react, vendor-inertia, vendor-radix, vendor-headlessui, vendor-maps, vendor-icons
- **`components.json`** — shadcn `radix-nova` style with `menuColor: default`, `menuAccent: subtle`; aliases point to `@/components/ui` but files live at `Components/ui/` (capital C)
- **SPK matching** — `App\Helpers\TextSimilarity::calculate()` (TF-IDF Cosine Similarity); `JobPosting` has `weight_skill`, `weight_education`, `weight_experience`, `weight_age`
- **Master data** — `MasterCategory` (tabs: Keahlian, Sektor Industri, Program Studi) → `MasterItem` (values); `POST /api/master-data/keahlian/quick-add` is inside `routes/web.php` (no auth)
- **Alumni import** — Admin Kampus: `GET /admin-kampus/alumni/template` (XLSX download), `POST /admin-kampus/alumni/import` (CSV upload)
- **Tracer Study toggle** — `PATCH /admin-kampus/tracer-study/{id}/toggle` enables/disables form
- **JSON casts** — `AlumniProfile.skills`, `JobPosting.requirements`, `TracerStudyForm.questions`, `ForumTopic.attachment`, `ForumReply.attachment`, `JobApplication.interview_details` are arrays; booleans: `is_active`, `is_open_to_work`, `privacy_*`, `is_announcement`
- **Location columns** — `province`, `city`, `latitude`, `longitude` on `AlumniProfile`, `Company`, `JobPosting` (added via later migrations)
- **User `$fillable`** — PHP 8 `#[Fillable(['name', 'email', 'password'])]`; DB also has `role` enum column (redundant with Spatie — always use Spatie roles)
- **`User` helpers** — `$user->getRoleNameAttribute()` returns first role name; `$user->isBlockedBy($id)`, `$user->hasBlocked($id)`, `$user->totalUnreadMessages()`
- **`JobPosting`** — both `$guarded = []` and `$fillable` (all columns mass-assignable); fields: `work_model`, `min_education`, `min_experience`, `max_age`, weight columns
- **`JobApplication`** — `scopeMenunggu()` for pending status
- **`AlumniProfile`** — `employment_status` (Bekerja/Mencari Kerja/Tidak Bekerja) + `is_open_to_work` + privacy booleans
- **`ForumTopic`** — `is_announcement` boolean; `parent_id` on `ForumReply` for threaded replies; `slug` and `last_reply_at` auto-filled in `booted()`
- **`MouDocument`** — `status` (active/expired/terminated), `signed_at`, `expires_at`; Admin Kampus terminates via `mitra.terminate`
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; use `npm install --ignore-scripts`
- **Private file serving** — `GET /storage/private/{path}` via `PrivateFileController` (behind `auth`, glob `where('path', '.*')`); role-based ACL in controller
- **Forum policies** — `ForumTopicPolicy` + `ForumReplyPolicy` bound via `Gate::policy()` in `AppServiceProvider` (not route middleware)
- **Seeder** — uses explicit `new User()` via `DatabaseSeeder` (not factories; `UserFactory` exists for tests only); clears Spatie cache at start
- **Guest landing** — `/` → `GuestController@index` renders `Welcome` page with latest jobs, top skills, partner companies

## Gotchas

- `.env` uses PostgreSQL with real credentials; `.env.example` defaults to SQLite — never commit secrets
- `ForumTopic.slug` not-null — `booted()` auto-fills from title via `Str::slug`; `attachment` JSON yields computed `attachment_urls` accessor (`Storage::url`)
- Forum topic/reply create routes throttled: `throttle:3,10` and `throttle:5,10`
- Test logins (all `password123`): `superadmin@sitami.ac.id`, `adminkampus@sitami.ac.id`, `fiko@alumni.sitami.ac.id`, `hrd@inovasidinamika.com`; more in `database/seeders/DatabaseSeeder.php`
- Role-based login redirect in `AuthenticatedSessionController` — not in middleware
- `AlumniProfile` ↔ `Company` many-to-many via `company_saved_candidates` pivot (talent pool bookmarking)
- `MustVerifyEmail` is commented out in `User.php:5` — `verified` route middleware present but contract unimplemented, so email verification is **not enforced**
- `Model::preventLazyLoading()` enabled in `AppServiceProvider` for non-production — N+1 queries throw exceptions in dev
- shadcn config aliases (`components.json`) point to `@/components/ui` (lowercase `components/`), but actual files live at `resources/js/Components/ui/` (capital C) — imports use `@/Components/ui/...`
- Tests are Breeze-generated only (Auth + Profile) — no custom feature tests exist yet
- CV feature flash keys (`draft_cv_path`, `draft_cv_name`) exist in session middleware but `CurriculumVitae` model not yet created
- Admin PT users whose company `verification_status === 'rejected'` are locked out on login
- `IndustrySektor` and `ProgramStudi` models exist but are **unused** — master data is handled via `MasterCategory`/`MasterItem`
