# SITAMI — Agent Guide

**Sistem Informasi Tracer Study & Alumni** — Laravel 13, Inertia.js 2, React 18, shadcn/ui `radix-nova`.

## Stack

| Layer | Tech | Key detail |
|-------|------|------------|
| Backend | Laravel 13, PHP 8.3+ | Monolithic — all app routes in `routes/web.php` (no `api.php`) |
| Frontend | React 18, Inertia.js 2, Tailwind 3, PostCSS | `.jsx` only, no TS; entrypoint `resources/js/app.jsx` |
| UI | shadcn/ui `radix-nova` | Components config in `components.json`; CSS vars: HSL + oklch in `app.css`; `@tailwindcss/forms` in devDeps but **not** in plugins; `resources/js/components/` directory absent — no components generated yet |
| DB | PostgreSQL (dev), SQLite `:memory:` (test) | phpunit.xml overrides env; `.env.example` defaults to SQLite |
| Auth | Breeze + Sanctum | Email verification on; session/cache/queue all default to `database` driver |
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
| `composer setup` | full bootstrap — `composer install`, copy `.env`, `key:generate`, `migrate`, `npm install --ignore-scripts`, `npm run build` |
| `php artisan migrate:fresh --seed` | Reset DB with demo data |
| `php artisan test --filter=<name>` | Single test class/method |
| `./vendor/bin/pint` | PHP code style fix (Laravel Pint) |
| `php artisan storage:link` | Required — serves CVs, photos, MoU docs |

## Shared Inertia props

`auth.user` — keys: `id, name, email, roles: string[], notifications, unread_count` or `null`. Only 5 latest unread notifications sent. `roles` is a plain array from `$user->getRoleNames()`.

Flash keys — `message`, `error`, `duplicates`, `draft_body`, `draft_cv_path`, `draft_cv_name`.

## Conventions

- **Path aliases** — `@/` → `resources/js/` (`jsconfig.json`); `ziggy-js` → `./vendor/tightenco/ziggy`
- **Forms** — `@inertiajs/react`'s `useForm` (not react-hook-form)
- **`cn()`** — `@/lib/utils` exports `clsx` + `tailwind-merge`
- **Layouts** — `AuthenticatedLayout` and `GuestLayout` in `resources/js/Layouts/`
- **Notifications** — `SystemNotification($title, $body, $url, $type)` via `$user->notify(...)` (database channel only); polled on frontend via `auth.user.notifications`
- **Messaging** — poll-based (no broadcasting); routes prefixed with `/messages`; includes block/unblock, conversation clear, delete message, company-to-alumni invite
- **Maps** — `react-leaflet` + `leaflet`
- **SPK matching** — `App\Helpers\TextSimilarity::calculate()` (TF-IDF Cosine Similarity); `JobPosting` has `weight_skill/education/experience/age`
- **Master data** — `MasterCategory` (tabs: Keahlian, Sektor Industri, Program Studi) → `MasterItem` (values); `POST /api/master-data/keahlian/quick-add` is **public** (no auth)
- **JSON casts** — `AlumniProfile.skills`, `JobPosting.requirements`, `TracerStudyForm.questions`, `ForumTopic.attachment`, `JobApplication.interview_details` are JSON arrays/objects; `JobPosting.is_active`, `AlumniProfile.is_open_to_work`, `AlumniProfile.privacy_*`, `ForumTopic.is_announcement` are booleans
- **User `$fillable`** — PHP 8 `#[Fillable(['name', 'email', 'password'])]`; DB also has `role` enum column (redundant with Spatie — do NOT rely on it; always use Spatie roles)
- **`User` helpers** — `$user->getRoleNameAttribute()` returns first role name; `$user->isBlockedBy($id)`, `$user->hasBlocked($id)`, `$user->totalUnreadMessages()`
- **`JobPosting`** — Has both `$guarded = []` and `$fillable` (all columns mass-assignable); `work_model` field exists
- **`JobApplication`** — `scopeMenunggu()` for pending status
- **npm scripts disabled** — `.npmrc` has `ignore-scripts=true`; `npm install --ignore-scripts` in `composer setup`
- **Private file serving** — `GET /storage/private/{path}` via `PrivateFileController` (behind `auth`, glob `where('path', '.*')`); role-based ACL in controller
- **Forum policies** — `ForumTopicPolicy` + `ForumReplyPolicy` bound via `Gate::policy()` in `AppServiceProvider` (not route middleware)
- **Dev guard** — `Model::preventLazyLoading(!$app->isProduction())` in `AppServiceProvider`
- **Login rejection** — `Admin PT` users whose company `verification_status === 'rejected'` are locked out on login
- **Seeder** — uses explicit `new User()` records via `DatabaseSeeder` (not factories; `UserFactory` exists for tests only); clears Spatie cache at start
- **Vite** — manual chunking for react, inertia, radix-ui, headlessui, leaflet, lucide
- **Guest landing** — `/` → `GuestController@index` renders `Welcome` page with latest jobs, top skills, partner companies

## Gotchas

- `.env` uses PostgreSQL with real credentials; `.env.example` defaults to SQLite — commit carefully, never expose secrets
- `ForumTopic.slug` not-null — `booted()` auto-fills from title via `Str::slug`; `attachment` JSON yields computed `attachment_urls` accessor (`Storage::url`)
- Forum topic/reply create routes throttled: `throttle:3,10` and `throttle:5,10`
- Test logins (all `password123`): `superadmin@sitami.ac.id`, `adminkampus@sitami.ac.id`, `fiko@alumni.sitami.ac.id`, `hrd@inovasidinamika.com`; more in `database/seeders/DatabaseSeeder.php`
- Timezone: UTC; no CI workflows (`.github` directory absent)
- Role-based login redirect in `AuthenticatedSessionController` — not in middleware
- `AlumniProfile` ↔ `Company` many-to-many via `company_saved_candidates` pivot table (talent pool bookmarking)
- `resources/js/components/` does not exist — shadcn/ui components have not been generated yet
- Tests only include Breeze auth tests — no custom feature tests exist yet
- `CurriculumVitae` model/flash keys (`draft_cv_path`, `draft_cv_name`) suggest an in-progress CV feature not fully wired
