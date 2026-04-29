# EVMS Frontend – Angular Client

 
---

## Overview

This is the frontend client for EVMS. It is a standalone Angular SPA served at `http://localhost:4200` in development. It communicates with the NestJS backend API at `http://localhost:3100`.

**Key capabilities:**
- Role-aware routing and navigation (Admin / Organizer / Volunteer views)
- JWT authentication with route guards
- Event browsing, application submission, and status tracking
- Organizer dashboards for application review and check-in
- Admin user management and system settings
- Charts and PDF export for reporting

---

## App Structure

```text
src/
├── app/
│   ├── auth/
│   │   ├── login/              # Login page component
│   │   ├── register/           # Registration page component
│   │   └── guards/             # AuthGuard, RoleGuard for route protection
│   │
│   ├── layout/
│   │   ├── main-layout/        # Shell component with sidebar + topbar
│   │   └── sidebar/            # Role-aware navigation menu
│   │
│   ├── pages/
│   │   ├── home/               # Dashboard / landing page
│   │   ├── events/             # Events Hub (volunteer view)
│   │   ├── event-manager/      # Create & edit events (organizer)
│   │   ├── applications/       # Application review (organizer)
│   │   ├── my-applications/    # Application status (volunteer)
│   │   ├── attendance/         # Attendance overview
│   │   ├── manual-checkin/     # On-site check-in form
│   │   ├── reports/            # Analytics and PDF export
│   │   └── settings/           # User & role management (admin)
│   │
│   ├── volunteer/
│   │   ├── volunteer-list/     # Directory of all volunteers
│   │   ├── volunteer-detail/   # Individual profile view
│   │   └── volunteer-edit/     # Edit volunteer profile form
│   │
│   ├── shared/
│   │   └── components/         # Reusable UI elements (cards, tables, etc.)
│   │
│   └── app.routes.ts           # Root routing configuration
│
├── public/                     # Static assets
├── angular.json                # Angular CLI workspace config
└── package.json
```

---

## Routing

The application uses Angular's standalone routing defined in `app.routes.ts`. Route access is controlled by `AuthGuard` and `RoleGuard`.

| Route | Page | Roles Allowed |
|---|---|---|
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/home` | Dashboard | All |
| `/events` | Events Hub | Volunteer, Organizer, Admin |
| `/events/:id` | Event Details | All |
| `/event-manager` | Create / Manage Events | Organizer, Admin |
| `/applications` | Application Review | Organizer, Admin |
| `/my-applications` | My Applications | Volunteer |
| `/volunteer` | Volunteer Directory | All |
| `/volunteer/:id` | Volunteer Profile | All |
| `/attendance` | Attendance Overview | Organizer, Admin |
| `/manual-checkin` | Manual Check-in | Organizer, Admin |
| `/reports` | Reports & Analytics | Admin, Organizer |
| `/settings` | User Management | Admin |

---

## Key Components & Pages

### Auth
- **Login** — Email/password form. On success, stores JWT in session and redirects to dashboard.
- **Register** — New account form. Defaults to Volunteer role.
- **AuthGuard** — Redirects unauthenticated users to `/login`.
- **RoleGuard** — Blocks access to routes the user's role isn't permitted to view.

### Events Hub (`/events`)
- Displays all upcoming events as cards.
- Click any card to view full event details.
- Volunteers see an **Apply** button on the detail page.

### Event Manager (`/event-manager`)
- Organizers and Admins can create new events via a validated form.
- Existing events are listed with edit and delete actions.

### Applications (`/applications`)
- Organizers see all incoming volunteer applications.
- Accept or Reject buttons update the application status immediately.

### My Applications (`/my-applications`)
- Volunteers track their submitted applications and their current status.

### Manual Check-in (`/manual-checkin`)
- Select an event from a dropdown.
- Search for a volunteer by name.
- Click **Check-in** to log attendance.

### Reports (`/reports`)
- Bar and pie charts rendered with Chart.js showing system metrics.
- **Export to PDF** button generates a formatted report using jsPDF.

### Settings (`/settings`)
- Admin-only page listing all registered users.
- Change any user's role from a dropdown.

---

## Services

Angular services handle all HTTP communication with the backend API at `http://localhost:3100`.

| Service | Responsibility |
|---|---|
| `AuthService` | Login, register, JWT storage, current user state |
| `EventService` | CRUD for events |
| `ApplicationService` | Submit and manage volunteer applications |
| `AttendanceService` | Fetch and record attendance |
| `VolunteerService` | Volunteer profile queries and updates |
| `UserService` | Admin user management (list, update role, delete) |
| `ReportService` | Fetch aggregated stats for dashboard |
| `CheckinService` | Manual check-in requests |

---

## Setup & Running

### Prerequisites

- Node.js v18+
- npm
- Backend API running at `http://localhost:3100`

### Installation

```bash
# Clone the repo
git clone https://github.com/heshmaduwantha/evms-sep-group-4-frontend.git
cd evms-sep-group-4-frontend

# Install dependencies
npm install
```

### Running

```bash
# Start development server
npm start
# or
ng serve
```

The app opens at `http://localhost:4200`. It automatically reloads on file changes.

### Available Scripts

| Script | Command | Description |
|---|---|---|
| Start | `npm start` | Launch dev server on port 4200 |
| Build | `npm run build` | Production build to `dist/` |
| Watch | `npm run watch` | Build and watch in development mode |
| Test | `npm run test` | Run unit tests via Karma |

### Code Generation (Angular CLI)

```bash
# Generate a new component
ng generate component component-name

# Generate a service
ng generate service service-name

# Generate a guard
ng generate guard guard-name

# Other schematics
ng generate directive|pipe|class|interface|enum|module
```

---

## Building for Production

```bash
npm run build
```

Build output is placed in `dist/temp-frontend/`. Serve this folder with any static web server (e.g., Nginx, Apache, or `npx serve`).

**Recommended Nginx config snippet:**

```nginx
server {
  listen 80;
  root /var/www/evms/dist/temp-frontend;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api/ {
    proxy_pass http://localhost:3100/;
  }
}
```

---

## Connecting to the Backend

The frontend expects the backend API at `http://localhost:3100`. To change this (e.g. for staging or production), update the base API URL in your Angular environment files:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3100'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com'
};
```

---

## UI Libraries

| Library | Version | Usage |
|---|---|---|
| PrimeNG | 17.18.12 | Buttons, tables, dropdowns, dialogs, forms |
| PrimeFlex | 4.0.0 | Responsive grid and spacing utilities |
| PrimeIcons | 7.0.0 | Icon set used across components |
| Angular Material | 21.2.3 | Supplemental components (mat-table, mat-form-field) |
| Chart.js | 4.5.1 | Bar, pie, and line charts on the reports page |
| jsPDF | 4.2.1 | PDF generation |
| jsPDF-autotable | 5.0.7 | Structured tables inside PDF exports |
| @fontsource/inter | 5.2.8 | Inter font family |
