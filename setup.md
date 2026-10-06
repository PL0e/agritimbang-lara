# AgriTimbang --- Local Development Setup

This guide explains how to run the AgriTimbang Laravel backend on a
local development machine.

## Prerequisites

Install PHP 8.2 or later, Composer 2, Git, and Node.js/npm. SQLite is the
default local database and requires the PHP `pdo_sqlite` extension. MySQL
is optional for local development and production deployments.

```bash
php -v
composer --version
```

## 1. Clone the Repository

```bash
git clone https://github.com/ShemHooks/agritimbang-lara.git
cd agritimbang
```

## 2. Install Dependencies

```bash
composer install
```

## 3. Create the Environment File

Windows Command Prompt:

```bash
copy .env.example .env
```

PowerShell, macOS, or Linux:

```bash
cp .env.example .env
```

## 4. Generate the Application Key

```bash
php artisan key:generate
```

## 5. Configure the Database

The repository defaults to SQLite. Leave `DB_CONNECTION=sqlite` in `.env`;
Laravel creates `database/database.sqlite` when migrations run.

To use MySQL instead, create an empty database:

```sql
CREATE DATABASE agritimbang
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

## 6. Configure `.env` for MySQL (Optional)

Configure the database connection for your own local MySQL installation:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=agritimbang
DB_USERNAME=root
DB_PASSWORD=
```

Use the actual port, username, and password configured on your machine.
A custom MySQL installation may use a port other than `3306`.

## 7. Run Migrations and Seed Roles and Locations

For a new installation:

```bash
php artisan migrate --seed
```

The seeders create the predefined roles and sample Cebu reference data for
municipality and barangay dropdowns. They use `updateOrCreate`, so rerunning
`php artisan db:seed` does not duplicate these rows. Admins can add more
municipalities and barangays from the application.

During development, if you intentionally want to erase the local
database and rebuild it:

```bash
php artisan migrate:fresh --seed
```

> **Warning:** `migrate:fresh` deletes all existing tables and local
> data.

## 8. Create the Initial System Administrator

AgriTimbang does not expose public Administrator registration. Create
the initial System Administrator from the terminal:

```bash
php artisan agritimbang:create-admin
```

Follow the prompts for the administrator details and password. The
generated account is provisioned as an active, verified Administrator.
The password must contain at least 8 characters.

## 9. Start Laravel

```bash
php artisan serve
```

Laravel normally starts at:

```text
http://127.0.0.1:8000
```

The app serves the integrated React/Vite interface and Laravel API from the
same origin. Build frontend assets after changing `resources/js` or
`resources/css`:

```bash
npm ci
npm run build
```

For Vite hot reload during development, run `npm run dev` in a second
terminal while Laravel is running.

The local API base is:

```text
http://127.0.0.1:8000/api
```

## 10. Useful Development Commands

```bash
php artisan serve
php artisan route:list --path=api
php artisan migrate
php artisan db:seed
php artisan migrate:fresh --seed
php artisan agritimbang:create-admin
php artisan optimize:clear
```

The standalone React prototype is in the separate
[`AgriTimbang`](https://github.com/PL0e/AgriTimbang) repository. Its demo
accounts and mock data are not Laravel accounts. Work on the integrated UI
in this repository under `resources/js`.

## Troubleshooting

### Database connection error

Verify `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, and
`DB_PASSWORD` in `.env`, then run:

```bash
php artisan optimize:clear
```

### `Unauthenticated`

Make sure the request contains:

```text
Authorization: Bearer <token>
```

### `403` / Not Authorized

The user is authenticated but does not have the role required by the
route. Administrator endpoints require the `admin` role.

### Roles are missing

```bash
php artisan db:seed
```

### Municipality or barangay dropdown is empty

Seed the local reference data:

```bash
php artisan db:seed
```

The farmer profile selector lists active municipalities and active barangays
belonging to the selected municipality.

For a disposable development database:

```bash
php artisan migrate:fresh --seed
```

### Application key is missing

```bash
php artisan key:generate
```

### Configuration changes are not taking effect

```bash
php artisan optimize:clear
```

## Fresh Setup --- Quick Version

```bash
git clone https://github.com/ShemHooks/agritimbang-lara.git
cd agritimbang
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan agritimbang:create-admin
npm ci
npm run build
php artisan serve
```

For Vite hot reload instead of a production asset build:

```bash
npm install
npm run dev
```

## AgriTimbang Account Provisioning

```text
System Administrator
    |
    +-- creates Municipality and Barangays
    |
    +-- creates LGU Authority for a Municipality
            |
            +-- creates LGU Encoder accounts for that Municipality

Farmer
    |
    +-- self-registers
    +-- saves address, municipality, and barangay in the farmer profile
    +-- uploads a PDF or PNG verification document (maximum 5 MB)
    +-- appears in the assigned LGU Authority's farmer list
```

The initial Administrator is created only through the Artisan command.
Public registration is reserved for Farmers. Admins can see registered
farmers and saved locations, but do not approve verification. An LGU
Authority sees farmers whose saved municipality matches its own and can
approve or return pending documents. Authorities create Encoders for their
municipality. Verification files are stored privately and served only
through authorized routes.

## Implementation File Map

The following files were added or updated for the integrated workflows.
Paths are relative to this Laravel repository.

### Added

- `app/Http/Controllers/AdminFarmerController.php` — Admin's read-only farmer list API.
- `app/Models/UserVerificationDocument.php` — autoloadable verification-document model; replaces the mismatched plural filename.
- `database/seeders/MunicipalitySeeder.php` and `database/seeders/BarangaySeeder.php` — repeatable local location choices.
- `resources/js/components/accounts/AdminFarmerList.tsx` — registered farmer list for Admin.
- `resources/js/components/accounts/AccountManagementPanel.tsx` — Municipality, Barangay, LGU Authority, and Encoder management forms.
- `resources/js/components/verification/FarmerVerificationQueue.tsx` — municipality-scoped farmer list and document review for LGU Authorities.
- `tests/Feature/LguAccountWorkflowTest.php` and `tests/Feature/VerificationDocumentFileTypeTest.php` — role, visibility, upload, and file-type coverage.

### Updated

- `routes/api.php`, `app/Http/Controllers/BarangayController.php`, `app/Http/Controllers/MunicipalityController.php`, `app/Http/Controllers/UserVerificationController.php`, and `app/Services/UserVerificationService.php` — farmer list, location reference, and verification workflows.
- `app/Http/Requests/UploadVerificationDocumentRequest.php` — PDF/PNG-only server validation, 5 MB maximum.
- `database/seeders/DatabaseSeeder.php` — runs role and location seeders.
- `resources/js/App.tsx` and `resources/js/layouts/DashboardLayout.tsx` — role mapping and authenticated dashboard rendering.
- `resources/js/pages/RecordsPage.tsx` and `resources/js/pages/ProfileSettingsPage.tsx` — account lists, profile/location editing, and real document upload.
- `resources/css/app.css` — clickable PDF/PNG file-picker area.
- `setup.md` — local setup, account workflow, troubleshooting, and implementation file map.

Useful account endpoints:

- `GET /api/admin/farmers` — Admin's read-only farmer account list.
- `GET /api/lgu/farmers` — farmers with profiles in the signed-in Authority's municipality.
- `GET /api/lgu/encoders` and `POST /api/lgu/encoders` — Authority's Encoder list and creation.
- `GET /api/lgu/farmer-verifications` — pending document reviews for the Authority's municipality.
