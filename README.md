# AgriTimbang

AgriTimbang is a Laravel application with an integrated React frontend for
livestock price transparency, farmer profiles, LGU administration, and
transaction workflows.

## Run locally

See [setup.md](./setup.md) for prerequisites and the complete setup guide. In
short, install the PHP and JavaScript dependencies, configure `.env`, prepare
the local database, and build the frontend:

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate --seed
npm ci
npm run build
php artisan serve
```

Open `http://127.0.0.1:8000`. Create the initial System Administrator with
`php artisan agritimbang:create-admin`. Admins can create LGU Authority
accounts; LGU Authorities can create Encoder accounts. Farmers can register
from the sign-in page. No shared demo credentials are included in this
repository.

## Client demo guide

The frontend has role-specific workspaces for System Administrators, LGU
Authorities, LGU Encoders, and Farmers. For a clear demo, sign in with a
separate account for each role and show the relevant navigation and profile
menu.

### Connected workflows

These flows use the Laravel API and local database:

- **Sign in, farmer registration, and session restore:** Register a farmer
  from the sign-in screen, see the success confirmation, and show that the
  newly registered account is signed in. Sign out and sign back in to
  demonstrate session handling.
- **Admin account and location management:** View registered farmers, create
  municipalities and barangays, and create LGU Authority accounts. Successful
  submissions show a confirmation popup. Administrators can activate or
  deactivate farmer and LGU Authority accounts; deactivation revokes active
  sessions.
- **LGU Encoder management:** Sign in as an LGU Authority, create an Encoder
  account for the assigned municipality, update its active status, and show
  the updated account list.
- **Farmer profile and verification:** As a Farmer, select a municipality and
  barangay, save the profile, then submit a PDF or PNG verification document
  (up to 5 MB) for LGU review. Update personal details and change the password
  from Profile settings.
- **LGU farmer verification:** As an LGU Authority, open Farmer approvals to
  review farmers and their submitted verification documents for the
  Authority's municipality.
- **Role-aware profile menu:** Open Profile settings as any role. Farmer
  profile editing remains available; Admin, LGU Authority, and LGU Encoder
  users can edit their own contact/profile information without changing their
  role or assigned municipality.
- **Password management and audit activity:** Change a password from Profile
  settings, request a reset link from sign-in, and review live account,
  authentication, status, and farmer-verification events in the Admin
  System settings audit activity.

Password reset delivery uses Laravel's configured mail transport. For a local
development setup, the default `MAIL_MAILER=log` writes reset emails to
`storage/logs/laravel.log`; configure SMTP or another supported mailer in
`.env` to deliver reset links to inboxes.

### Frontend flows to present as prototypes

Some screens currently use frontend sample data or local component state
rather than saving changes to the backend. They are useful for demonstrating
the intended workflow and interface, but changes are not durable:

- **Overview, prices, monitoring, calculators, and system settings controls:**
  Dashboard figures, sample prices, and configuration controls are
  illustrative. The Admin audit activity list is connected to the database.
- **Livestock drafts, breed configuration, and transaction wizard:** Creation
  and success confirmations demonstrate the flow; records are not persisted
  by these frontend screens.
- **Price draft review and encoder transaction lookup:** Status changes and
  sample records are illustrative.
- **LGU transaction validation:** The transaction examples and status actions
  are currently presentation-only.

When showing a prototype flow, explain that its sample data is for interface
demonstration and is not a saved or authoritative market record. Successful
popups confirm the frontend action; they do not by themselves imply that every
screen is connected to persistent storage.

## Useful commands

```bash
php artisan route:list --path=api
php artisan migrate
php artisan db:seed
npm run build
```
