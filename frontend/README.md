# RentFlow frontend

The frontend is a React single-page application built with Vite. It provides the tenant, landlord, and admin experiences for RentFlow.

## Getting started

Install the frontend dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

The app expects the backend API at `http://localhost:5000` during development. Start the backend separately from the repository root. `VITE_API_URL` can be set when the Socket.IO server uses a different URL.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint on the frontend |

## Structure

```text
src/
  components/  Shared UI and feature components
    admin/             Admin dashboard panels and modals
    announcements/     Announcement creation UI
    apartments/        Apartment views, maps, and room forms
    auth/              Authentication controls and route guards
    chat/              Messaging interface components
    layout/            Landlord and tenant layouts
    maintenance/       Maintenance forms
    tenant/            Tenant dashboard components
    tenant-management/ Landlord tenant management dialogs
    ui/                Reusable interface primitives
    utils/             Shared helpers
  context/     React context providers
  pages/       Route-level screens grouped by audience or feature
    public/    Unauthenticated, public-facing screens
    auth/      Sign-in, signup, and account recovery screens
    tenant/    Tenant screens
    landlord/  Landlord screens
    admin/     Admin screens and page-specific components
    messaging/ Messaging screen shared by tenants and landlords
  store/       Zustand state stores
  App.jsx      Routes and application-level auth flow
  main.jsx     Browser entry point
public/
  image/       Images referenced by public URL
  service-worker.js
```

Static files in `public/` are served from the site root. The app icons and web manifest live there as well.
