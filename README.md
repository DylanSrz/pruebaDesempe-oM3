# CineApp — Cinema Showtimes & Ticket Booking SPA

## Description

CineApp is a Single Page Application (SPA) that lets a cinema chain manage its
showtimes and lets customers book tickets online. It implements authentication,
role-based authorization (admin / user), session persistence and full CRUD
operations against a mock REST API powered by [json-server](https://github.com/typicode/json-server).

The app was built as the deliverable for the **JavaScript module performance test**
(see `practicaJS.txt`). It covers all the mandatory requirements plus the optional
modules (room management, statistics dashboard, dark mode and search/filters).

## Technologies used

- **Vanilla JavaScript** (ES Modules) — no UI framework.
- **Vite** — dev server and bundler.
- **Bootstrap 5** — styling and UI components (modals, toasts, tables, navbar).
- **json-server** — simulated REST API and database (`db.json`).
- **Fetch API** — HTTP requests.
- **Hash-based router** + **localStorage** — client-side routing and session persistence.

## Installation

Requires Node.js 18+.

```bash
npm install
```

## Running the project

In one terminal:

```bash
npm start
```

Or also in **two processes**: the simulated API and the Vite development server.

In one terminal, start the API:

```bash
npm run api
```

In a second terminal, start the front end:

```bash
npm run dev
```

Then open the URL printed by Vite (default: http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

## Running json-server

`npm run api` runs:

```bash
json-server --watch db.json --port 3000
```

The API is served at `http://localhost:3000` with these resources:

- `GET/POST/PUT/PATCH/DELETE /users`
- `GET/POST/PUT/PATCH/DELETE /rooms`
- `GET/POST/PUT/PATCH/DELETE /functions`
- `GET/POST/PUT/PATCH/DELETE /reservations`

The base URL is configured in `src/api/http.js` (`BASE_URL`).

## Test users

| Role  | Email               | Password   |
| ----- | ------------------- | ---------- |
| Admin | admin@cineapp.com   | admin123   |
| User  | bob@cineapp.com     | user123    |
| User  | carla@cineapp.com   | user123    |

## Project structure

```
.
├── index.html              # Single HTML shell (navbar + #app + toasts)
├── db.json                 # json-server database (seed data)
├── vite.config.js
├── package.json
└── src/
    ├── main.js             # Entry: styles, theme, router bootstrap
    ├── routes.js           # Route table with auth/role metadata
    ├── router/
    │   └── router.js       # Hash router + route guards
    ├── api/                # One module per resource (http wrapper + endpoints)
    │   ├── http.js
    │   ├── auth.api.js
    │   ├── functions.api.js
    │   ├── reservations.api.js
    │   ├── rooms.api.js
    │   └── users.api.js
    ├── store/
    │   └── session.js      # localStorage session management
    ├── services/           # Business rules & aggregations
    │   ├── reservations.service.js
    │   └── stats.service.js
    ├── components/         # Reusable UI: navbar, modal, toast, theme
    ├── views/              # One module per screen (login, catalog, admin/*)
    ├── utils/              # dom, validators, format helpers
    └── styles/
        └── main.css
```

## Role permissions

### Admin

- View all reservations and approve / cancel / delete them.
- Create, edit and delete functions.
- Create, edit and delete rooms.
- View all registered users.
- View the occupancy statistics dashboard.

### User

- Browse the available showtimes (with search and date filter).
- Book tickets for a function.
- View **only** their own reservations.
- Edit their own active reservations (while the function has not started).
- Cancel their own reservations.

Users cannot manage functions or rooms, cannot see other users' reservations and
cannot access admin modules. Authorization is enforced by route guards in
`src/router/router.js` using the `meta: { auth, roles }` metadata declared in
`src/routes.js`.

## Business rules

- A reservation cannot exceed the function's available seats.
- A cancelled function cannot receive new reservations.
- A user can only modify active reservations, and only before the function starts.
- Cancelled reservations cannot be reactivated.
- The admin can modify any reservation.
- Available seats are updated automatically when a reservation is created,
  modified or cancelled (`src/services/reservations.service.js`).

## Technical decisions

- **Vanilla JS + Vite**: the test asks for Vanilla JS; Vite adds a fast dev server,
  HMR and a simple production build without pulling in a UI framework.
- **Layered, modular architecture**: `api` (data access) → `services` (business
  rules) → `views`/`components` (presentation). This keeps domain logic out of the
  UI and makes each piece independently testable and reusable.
- **Hash router with guards**: a small custom router (no dependency) maps `#/path`
  to view functions and enforces authentication/role rules before rendering —
  a simulated middleware/guard layer as required.
- **localStorage for session**: the session survives page refreshes; logout fully
  clears the stored data.
- **Bootstrap 5**: provides accessible, responsive components out of the box and
  native dark mode via the `data-bs-theme` attribute, which the theme toggle persists.
- **Seat synchronization in the service layer**: because json-server has no
  transactions, the reservation service updates the function's `availableSeats`
  via `PATCH` immediately after each reservation change to keep data consistent.
- **Authentication is simulated**: credentials are validated against json-server
  (no hashing/JWT), which is appropriate for this exercise's scope.

## Bonus features included

- 📊 **Dashboard** with occupancy and reservation statistics.
- 🌙 **Dark mode** toggle, persisted across sessions.
- 🔎 **Search** by movie and **date filter** in the catalog.
- 🏟️ **Room management** module (functions are tied to existing rooms).
